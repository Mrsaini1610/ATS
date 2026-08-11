<?php

namespace App\Support;

use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class JobQuestionHelper
{
    private const TEXT = 'text';
    private const TEXTAREA = 'textarea';
    private const SINGLE_SELECT = 'single_select';
    private const MULTI_SELECT = 'multi_select';

    private const SELECT_TYPES = [
        self::SINGLE_SELECT,
        self::MULTI_SELECT,
    ];

    public static function supportedTypes(): array
    {
        return [
            self::TEXT,
            self::TEXTAREA,
            self::SINGLE_SELECT,
            self::MULTI_SELECT,
        ];
    }

    public static function normalizeQuestions(mixed $input): array
    {
        $items = self::decodePayload($input, 'application_questions');
        if ($items === null) {
            return [];
        }

        if (!is_array($items)) {
            throw ValidationException::withMessages([
                'application_questions' => 'Application questions payload must be a valid array.',
            ]);
        }

        $normalized = [];

        foreach (array_values($items) as $index => $item) {
            if (!is_array($item)) {
                throw ValidationException::withMessages([
                    "application_questions.$index" => 'Each application question must be a valid object.',
                ]);
            }

            $question = trim((string) ($item['question'] ?? $item['label'] ?? ''));
            $type = self::normalizeType($item['type'] ?? self::TEXT);
            $options = self::normalizeOptionList($item['options'] ?? []);
            $required = filter_var($item['required'] ?? false, FILTER_VALIDATE_BOOL);
            $hasAnyContent = $question !== '' || !empty($options);

            if (!$hasAnyContent) {
                continue;
            }

            if ($question === '') {
                throw ValidationException::withMessages([
                    "application_questions.$index.question" => 'Question text is required.',
                ]);
            }

            if ($type === null) {
                throw ValidationException::withMessages([
                    "application_questions.$index.type" => 'Unsupported question type provided.',
                ]);
            }

            if (in_array($type, self::SELECT_TYPES, true) && count($options) < 1) {
                throw ValidationException::withMessages([
                    "application_questions.$index.options" => 'At least one option is required for select questions.',
                ]);
            }

            $normalized[] = [
                'id' => self::normalizeIdentifier($item['id'] ?? null),
                'question' => $question,
                'type' => $type,
                'required' => $required,
                'options' => in_array($type, self::SELECT_TYPES, true) ? $options : [],
                'order' => count($normalized) + 1,
            ];
        }

        return $normalized;
    }

    public static function normalizeAnswers(mixed $input, array $questions): array
    {
        $answerMap = self::answerMap($input);
        $errors = [];
        $normalized = [];

        foreach ($questions as $index => $question) {
            $questionId = (string) ($question['id'] ?? '');
            $questionLabel = trim((string) ($question['question'] ?? ''));
            $questionType = self::normalizeType($question['type'] ?? null) ?? self::TEXT;
            $required = (bool) ($question['required'] ?? false);
            $options = self::normalizeOptionList($question['options'] ?? []);
            $rawAnswer = $answerMap[$questionId] ?? null;

            if ($questionType === self::MULTI_SELECT) {
                $answer = self::normalizeMultiSelectAnswer($rawAnswer);

                if ($required && count($answer) < 1) {
                    $errors["screening_answers.$index"] = "Answer is required for \"{$questionLabel}\".";
                }

                $invalidOptions = array_values(array_diff($answer, $options));
                if (!empty($invalidOptions)) {
                    $errors["screening_answers.$index"] = "Invalid option selected for \"{$questionLabel}\".";
                }

                $normalized[] = [
                    'question_id' => $questionId,
                    'question' => $questionLabel,
                    'type' => $questionType,
                    'required' => $required,
                    'options' => $options,
                    'answer' => $answer,
                ];

                continue;
            }

            $answer = trim((string) ($rawAnswer ?? ''));

            if ($required && $answer === '') {
                $errors["screening_answers.$index"] = "Answer is required for \"{$questionLabel}\".";
            }

            if ($answer !== '' && $questionType === self::SINGLE_SELECT && !in_array($answer, $options, true)) {
                $errors["screening_answers.$index"] = "Invalid option selected for \"{$questionLabel}\".";
            }

            if ($answer !== '') {
                $maxLength = $questionType === self::TEXTAREA ? 5000 : 1000;
                if (mb_strlen($answer) > $maxLength) {
                    $errors["screening_answers.$index"] = "\"{$questionLabel}\" exceeds the allowed character limit.";
                }
            }

            $normalized[] = [
                'question_id' => $questionId,
                'question' => $questionLabel,
                'type' => $questionType,
                'required' => $required,
                'options' => $options,
                'answer' => $answer,
            ];
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }

        return $normalized;
    }

    private static function answerMap(mixed $input): array
    {
        $items = self::decodePayload($input, 'screening_answers');
        if ($items === null) {
            return [];
        }

        if (!is_array($items)) {
            throw ValidationException::withMessages([
                'screening_answers' => 'Screening answers payload must be a valid array.',
            ]);
        }

        if (array_is_list($items)) {
            $mapped = [];
            foreach ($items as $item) {
                if (!is_array($item)) {
                    continue;
                }

                $questionId = (string) ($item['question_id'] ?? '');
                if ($questionId === '') {
                    continue;
                }

                $mapped[$questionId] = $item['answer'] ?? null;
            }

            return $mapped;
        }

        return $items;
    }

    private static function decodePayload(mixed $input, string $field): mixed
    {
        if ($input === null || $input === '') {
            return null;
        }

        if (is_string($input)) {
            $decoded = json_decode($input, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw ValidationException::withMessages([
                    $field => 'Invalid JSON payload provided.',
                ]);
            }

            return $decoded;
        }

        return $input;
    }

    private static function normalizeType(mixed $value): ?string
    {
        $type = Str::of((string) $value)
            ->trim()
            ->lower()
            ->replace('-', '_')
            ->replace('multiple', 'multi')
            ->value();

        return match ($type) {
            'text' => self::TEXT,
            'textarea', 'long_text' => self::TEXTAREA,
            'single_select', 'select', 'radio' => self::SINGLE_SELECT,
            'multi_select', 'multiselect', 'checkbox', 'checkboxes' => self::MULTI_SELECT,
            default => null,
        };
    }

    private static function normalizeOptionList(mixed $input): array
    {
        if (is_string($input)) {
            $decoded = json_decode($input, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $input = $decoded;
            } else {
                $input = preg_split('/[\r\n,]+/', $input) ?: [];
            }
        }

        if (!is_array($input)) {
            return [];
        }

        $options = [];
        foreach ($input as $item) {
            $value = trim((string) $item);
            if ($value === '' || in_array($value, $options, true)) {
                continue;
            }

            $options[] = $value;
        }

        return array_values($options);
    }

    private static function normalizeMultiSelectAnswer(mixed $value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $value = $decoded;
            } else {
                $value = preg_split('/[\r\n,]+/', $value) ?: [];
            }
        }

        if (!is_array($value)) {
            return [];
        }

        $answers = [];
        foreach ($value as $item) {
            $answer = trim((string) $item);
            if ($answer === '' || in_array($answer, $answers, true)) {
                continue;
            }

            $answers[] = $answer;
        }

        return array_values($answers);
    }

    private static function normalizeIdentifier(mixed $value): string
    {
        $identifier = trim((string) $value);

        return $identifier !== '' ? $identifier : (string) Str::uuid();
    }
}
