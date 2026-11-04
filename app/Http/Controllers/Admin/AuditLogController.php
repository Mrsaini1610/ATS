<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SystemErrorLog;
use App\Services\AuditLogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response as FacadeResponse;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AuditLogController extends Controller
{
    /**
     * Display the System Audit, Incomplete Processes & Error Logs Dashboard.
     */
    public function index(Request $request): Response
    {
        $search      = $request->input('search');
        $module      = $request->input('module', 'all');
        $status      = $request->input('status', 'all');
        $tab         = $request->input('tab', 'audit'); // audit, incomplete, errors, server_log
        $filterMode  = $request->input('filter_mode', 'all'); // all, month, date_range, preset
        $month       = $request->input('month', now()->format('Y-m'));
        $fromDate    = $request->input('from_date');
        $toDate      = $request->input('to_date');
        $preset      = $request->input('preset', 'all'); // today, yesterday, last_7_days, this_month, last_month, all

        // 1. Audit Logs Query
        $auditQuery = AuditLog::query()->latest();

        if (!empty($search)) {
            $auditQuery->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('actor_name', 'like', "%{$search}%")
                  ->orWhere('actor_email', 'like', "%{$search}%")
                  ->orWhere('entity_id', 'like', "%{$search}%");
            });
        }

        if ($module !== 'all') {
            $auditQuery->where('module', $module);
        }

        if ($status !== 'all') {
            $auditQuery->where('status', $status);
        }

        // Apply Date / Month Filter to Audit Logs
        $dateRange = $this->resolveDateRange($filterMode, $month, $fromDate, $toDate, $preset);
        if ($dateRange) {
            $auditQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }

        $activities = $auditQuery->paginate(25)->withQueryString();

        // 2. Incomplete / Half-Finished Processes ("Kisne konsi process aadhi ki")
        $incompleteProcesses = AuditLogService::getIncompleteProcesses(60);

        // 3. System Error Logs Query ("Error logs")
        $errorQuery = SystemErrorLog::query()->latest();
        if (!empty($search) && $tab === 'errors') {
            $errorQuery->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                  ->orWhere('exception_class', 'like', "%{$search}%")
                  ->orWhere('url', 'like', "%{$search}%")
                  ->orWhere('actor_name', 'like', "%{$search}%");
            });
        }
        if ($dateRange && $tab === 'errors') {
            $errorQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }
        $errorLogs = $errorQuery->paginate(25, ['*'], 'error_page')->withQueryString();

        // 4. Server Log File Details (`storage/logs/laravel.log`)
        $serverLog = AuditLogService::getServerLogDetails(250);

        // 5. Summary Metrics
        $todayStart = Carbon::today();
        $metrics = [
            'total_activities_today' => AuditLog::where('created_at', '>=', $todayStart)->count(),
            'incomplete_count'       => count($incompleteProcesses),
            'errors_24h'             => SystemErrorLog::where('created_at', '>=', now()->subHours(24))->count(),
            'server_log_size'        => $serverLog['file_size'] ?? '0 KB',
            'server_log_path'        => $serverLog['file_path'] ?? '',
        ];

        return Inertia::render('Admin/Logs', [
            'activities'          => $activities,
            'incompleteProcesses' => $incompleteProcesses,
            'errorLogs'           => $errorLogs,
            'serverLog'           => $serverLog,
            'metrics'             => $metrics,
            'filters'             => [
                'search'      => $search,
                'module'      => $module,
                'status'      => $status,
                'tab'         => $tab,
                'filter_mode' => $filterMode,
                'month'       => $month,
                'from_date'   => $fromDate,
                'to_date'     => $toDate,
                'preset'      => $preset,
            ],
        ]);
    }

    /**
     * Export Logs in CSV or Excel (XLSX) format with Date / Month filtering.
     */
    public function export(Request $request)
    {
        $type       = $request->input('type', 'audit'); // audit, errors, incomplete
        $format     = strtolower($request->input('format', 'xlsx')); // xlsx or csv
        $filterMode = $request->input('filter_mode', 'all');
        $month      = $request->input('month', now()->format('Y-m'));
        $fromDate   = $request->input('from_date');
        $toDate     = $request->input('to_date');
        $preset     = $request->input('preset', 'all');
        $module     = $request->input('module', 'all');

        $dateRange = $this->resolveDateRange($filterMode, $month, $fromDate, $toDate, $preset);

        $periodLabel = 'all_time';
        if ($filterMode === 'month' && !empty($month)) {
            $periodLabel = 'month_' . str_replace('-', '_', $month);
        } elseif ($filterMode === 'date_range' && $fromDate && $toDate) {
            $periodLabel = "from_{$fromDate}_to_{$toDate}";
        } elseif ($filterMode === 'preset' && $preset !== 'all') {
            $periodLabel = $preset;
        }

        $timestamp = now()->format('Ymd_His');
        $fileName = "ats_{$type}_logs_{$periodLabel}_{$timestamp}." . ($format === 'csv' ? 'csv' : 'xlsx');

        // Fetch Export Data
        $data = $this->getExportData($type, $dateRange, $module);

        if ($format === 'csv') {
            return $this->exportToCsv($fileName, $data['headers'], $data['rows']);
        }

        return $this->exportToExcel($fileName, $data['sheetTitle'], $data['headers'], $data['rows']);
    }

    /**
     * Resolve Date Range from inputs (Month, Date Range, or Preset).
     */
    protected function resolveDateRange(?string $mode, ?string $month, ?string $fromDate, ?string $toDate, ?string $preset): ?array
    {
        if ($mode === 'month' && !empty($month)) {
            try {
                $start = Carbon::parse($month . '-01')->startOfMonth();
                $end   = Carbon::parse($month . '-01')->endOfMonth();
                return ['start' => $start, 'end' => $end];
            } catch (\Throwable $e) {}
        }

        if ($mode === 'date_range' && !empty($fromDate) && !empty($toDate)) {
            try {
                $start = Carbon::parse($fromDate)->startOfDay();
                $end   = Carbon::parse($toDate)->endOfDay();
                return ['start' => $start, 'end' => $end];
            } catch (\Throwable $e) {}
        }

        if ($mode === 'preset' || (!empty($preset) && $preset !== 'all')) {
            switch ($preset) {
                case 'today':
                    return ['start' => Carbon::today()->startOfDay(), 'end' => Carbon::today()->endOfDay()];
                case 'yesterday':
                    return ['start' => Carbon::yesterday()->startOfDay(), 'end' => Carbon::yesterday()->endOfDay()];
                case 'last_7_days':
                    return ['start' => now()->subDays(7)->startOfDay(), 'end' => now()->endOfDay()];
                case 'this_month':
                    return ['start' => now()->startOfMonth(), 'end' => now()->endOfMonth()];
                case 'last_month':
                    return ['start' => now()->subMonth()->startOfMonth(), 'end' => now()->subMonth()->endOfMonth()];
            }
        }

        return null;
    }

    /**
     * Compile table headers and rows based on type.
     */
    protected function getExportData(string $type, ?array $dateRange, string $module = 'all'): array
    {
        if ($type === 'errors') {
            $query = SystemErrorLog::query()->latest();
            if ($dateRange) {
                $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            }

            $headers = ['ID', 'Date Time', 'Status Code', 'Method', 'URL', 'Exception Class', 'Error Message', 'File Location', 'Line', 'Actor', 'IP Address'];
            $rows = [];

            foreach ($query->get() as $row) {
                $rows[] = [
                    $row->id,
                    $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : 'N/A',
                    $row->status_code,
                    $row->method,
                    $row->url,
                    $row->exception_class,
                    $row->message,
                    $row->file,
                    $row->line,
                    $row->actor_name ?: $row->actor_type ?: 'Guest',
                    $row->ip_address,
                ];
            }

            return [
                'sheetTitle' => 'System Errors',
                'headers'    => $headers,
                'rows'       => $rows,
            ];
        }

        if ($type === 'incomplete') {
            $items = AuditLogService::getIncompleteProcesses(100);
            $headers = ['ID', 'Category', 'Severity', 'Title', 'Description', 'Stalled / Missing Reason', 'Candidate / Actor', 'Phone', 'Email', 'Platform', 'Created Date'];
            $rows = [];

            foreach ($items as $item) {
                $rows[] = [
                    $item['id'],
                    $item['category'],
                    strtoupper($item['severity']),
                    $item['title'],
                    $item['description'],
                    $item['stalled_reason'],
                    $item['actor_name'],
                    $item['actor_phone'] ?? 'N/A',
                    $item['actor_email'] ?? 'N/A',
                    strtoupper($item['platform'] ?? 'web'),
                    $item['created_at'],
                ];
            }

            return [
                'sheetTitle' => 'Incomplete Workflows',
                'headers'    => $headers,
                'rows'       => $rows,
            ];
        }

        // Default: Audit logs
        $query = AuditLog::query()->latest();
        if ($dateRange) {
            $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }
        if ($module !== 'all') {
            $query->where('module', $module);
        }

        $headers = ['ID', 'Date Time', 'Actor Role', 'Actor Name', 'Actor Email', 'Action', 'Module', 'Status', 'Description', 'Platform', 'IP Address', 'Metadata / Payload'];
        $rows = [];

        foreach ($query->get() as $row) {
            $rows[] = [
                $row->id,
                $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : 'N/A',
                strtoupper($row->actor_type),
                $row->actor_name,
                $row->actor_email ?? 'N/A',
                $row->action,
                strtoupper($row->module),
                strtoupper($row->status),
                $row->description,
                strtoupper($row->platform),
                $row->ip_address,
                $row->details ? json_encode($row->details, JSON_UNESCAPED_UNICODE) : '',
            ];
        }

        return [
            'sheetTitle' => 'Activity Audit',
            'headers'    => $headers,
            'rows'       => $rows,
        ];
    }

    /**
     * Generate & Download Excel (XLSX) file using PhpSpreadsheet.
     */
    protected function exportToExcel(string $fileName, string $sheetTitle, array $headers, array $rows)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(substr($sheetTitle, 0, 31));

        // 1. Title Banner in Excel
        $colCount = count($headers);
        $lastColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colCount);

        $sheet->mergeCells("A1:{$lastColLetter}1");
        $sheet->setCellValue('A1', "ATS Recruitment Platform - {$sheetTitle} Export (" . now()->format('d M Y, h:i A') . ")");
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFFFFF'));
        $sheet->getStyle('A1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('1E3A8A');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(1)->setRowHeight(32);

        // 2. Table Column Headers
        foreach ($headers as $colIdx => $header) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx + 1);
            $sheet->setCellValue("{$colLetter}2", $header);
        }

        $headerStyle = [
            'font' => [
                'bold'  => true,
                'color' => ['argb' => 'FFFFFF'],
                'size'  => 11,
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['argb' => '2563EB'], // Blue 600
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['argb' => 'CBD5E1'],
                ],
            ],
        ];
        $sheet->getStyle("A2:{$lastColLetter}2")->applyFromArray($headerStyle);
        $sheet->getRowDimension(2)->setRowHeight(26);

        // 3. Fill Data Rows
        $currentRow = 3;
        foreach ($rows as $row) {
            foreach ($row as $colIdx => $val) {
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx + 1);
                $sheet->setCellValue("{$colLetter}{$currentRow}", $val);
            }

            // Alternating light gray zebra stripe
            if ($currentRow % 2 === 0) {
                $sheet->getStyle("A{$currentRow}:{$lastColLetter}{$currentRow}")
                    ->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()
                    ->setARGB('F8FAFC');
            }

            $sheet->getRowDimension($currentRow)->setRowHeight(20);
            $currentRow++;
        }

        // Apply borders & Auto-size column widths
        $dataRange = "A3:{$lastColLetter}" . ($currentRow - 1);
        if ($currentRow > 3) {
            $sheet->getStyle($dataRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('E2E8F0');
            $sheet->getStyle($dataRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        }

        foreach (range(1, $colCount) as $colIdx) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        // Stream response directly
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    /**
     * Generate & Download CSV file with UTF-8 BOM.
     */
    protected function exportToCsv(string $fileName, array $headers, array $rows)
    {
        $responseHeaders = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=\"{$fileName}\"",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0",
        ];

        $callback = function () use ($headers, $rows) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM so Microsoft Excel renders Hindi/Special characters perfectly
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, $headers);
            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        };

        return FacadeResponse::stream($callback, 200, $responseHeaders);
    }

    /**
     * Download the physical `storage/logs/laravel.log` file.
     */
    public function downloadServerLog()
    {
        $logPath = storage_path('logs/laravel.log');
        if (!File::exists($logPath)) {
            return redirect()->back()->with('error', 'Log file does not exist.');
        }

        return response()->download($logPath, 'ats_laravel_' . now()->format('Y-m-d') . '.log');
    }

    /**
     * Clear database error logs.
     */
    public function clearErrorLogs()
    {
        SystemErrorLog::truncate();
        AuditLogService::log('error_logs_cleared', 'System error logs were cleared by admin', [], 'system');

        return redirect()->back()->with('success', 'Database error logs cleared successfully.');
    }

    /**
     * Clear server `laravel.log` file.
     */
    public function clearServerLog()
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            $admin = auth('admin')->user();
            $adminName = $admin ? $admin->name : 'Admin';
            File::put($logPath, "[" . now()->format('Y-m-d H:i:s') . "] local.INFO: Log file cleared by {$adminName} (ID: " . ($admin?->id ?? 'system') . ")\n");
            AuditLogService::log('server_log_cleared', "Physical laravel.log was cleared by {$adminName}", [], 'system');
        }

        return redirect()->back()->with('success', 'Server log file cleared successfully.');
    }

    /**
     * Record a frontend client-side error.
     */
    public function logClientError(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'file'    => 'nullable|string',
            'line'    => 'nullable|integer',
            'col'     => 'nullable|integer',
            'stack'   => 'nullable|string',
            'url'     => 'nullable|string',
        ]);

        $actor = auth('admin')->user() ?: auth('web')->user();

        SystemErrorLog::create([
            'message'         => '[Frontend JS Error] ' . substr($validated['message'], 0, 4000),
            'exception_class' => 'ClientJavaScriptError',
            'file'            => $validated['file'] ?? null,
            'line'            => $validated['line'] ?? null,
            'trace'           => $validated['stack'] ?? null,
            'status_code'     => 400,
            'url'             => $validated['url'] ?? request()->fullUrl(),
            'method'          => 'CLIENT',
            'actor_type'      => $actor ? (property_exists($actor, 'role') ? $actor->role : 'candidate') : 'guest',
            'actor_id'        => $actor?->id,
            'actor_name'      => $actor?->name,
            'ip_address'      => request()->ip(),
            'user_agent'      => request()->userAgent(),
            'request_data'    => ['col' => $validated['col'] ?? null],
        ]);

        return response()->json(['success' => true]);
    }
}
