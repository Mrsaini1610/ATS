<?php

namespace Tests\Unit;

use App\Support\JobQuestionHelper;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\TestCase;

class JobQuestionHelperTest extends TestCase
{
    public function test_it_normalizes_question_definitions(): void
    {
        $questions = JobQuestionHelper::normalizeQuestions([
            [
                'question' => 'Current CTC?',
                'type' => 'textarea',
                'required' => true,
            ],
            [
                'question' => 'Preferred shift',
                'type' => 'single-select',
                'required' => false,
                'options' => ['Day', 'Night', 'Day'],
            ],
        ]);

        $this->assertCount(2, $questions);
        $this->assertSame('textarea', $questions[0]['type']);
        $this->assertTrue($questions[0]['required']);
        $this->assertSame('single_select', $questions[1]['type']);
        $this->assertSame(['Day', 'Night'], $questions[1]['options']);
        $this->assertNotEmpty($questions[0]['id']);
    }

    public function test_it_validates_required_and_multi_select_answers(): void
    {
        $questions = JobQuestionHelper::normalizeQuestions([
            [
                'id' => 'q-1',
                'question' => 'How many years of Laravel experience do you have?',
                'type' => 'text',
                'required' => true,
            ],
            [
                'id' => 'q-2',
                'question' => 'Which locations can you work from?',
                'type' => 'multi_select',
                'required' => true,
                'options' => ['Jaipur', 'Remote', 'Delhi'],
            ],
        ]);

        $answers = JobQuestionHelper::normalizeAnswers([
            'q-1' => '3',
            'q-2' => ['Jaipur', 'Remote'],
        ], $questions);

        $this->assertCount(2, $answers);
        $this->assertSame('3', $answers[0]['answer']);
        $this->assertSame(['Jaipur', 'Remote'], $answers[1]['answer']);
    }

    public function test_it_rejects_invalid_select_answers(): void
    {
        $this->expectException(ValidationException::class);

        $questions = JobQuestionHelper::normalizeQuestions([
            [
                'id' => 'q-1',
                'question' => 'Willing to relocate?',
                'type' => 'single_select',
                'required' => true,
                'options' => ['Yes', 'No'],
            ],
        ]);

        JobQuestionHelper::normalizeAnswers([
            'q-1' => 'Maybe',
        ], $questions);
    }
}
