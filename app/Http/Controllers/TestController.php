<?php

namespace App\Http\Controllers;

use App\Services\InteraktServices;
use Illuminate\Http\Request;

use function App\createMessagePayload;

class TestController extends Controller
{
    /**
     * Send Whatsapp Message
     * @return mixed
    */
    public function sendMessage(){
        $msgData = [
                "fullPhoneNumber" => "917733844020",
                "callbackData" => "some_callback_data",
                "type" => "Text",
                "data" => [
                    "message" => "Testing whatsapp message api for integrate in task management panel."
            ]
        ];

        $msg = new InteraktServices();
        $resp = $msg->sendMessage($msgData);
        return response()->json($resp);
    }

    
    /**
     * Send Whatsapp Template Message
     * @return mixed
    */
    public function sendTemplateMessage()
    {
        $phone = '7733844020';
        $templateName = 'testing_message_with_media_image';
        $tempLanguage = 'en';

        $headerParameters = ["https://www.shashiengicon.com/themes/images/slider/slide5.jpg"];
        $bodyParameters = [
            "Vikas Sain",
        ];

        $buttonParameters = (object) [
            "0" => ["https://google.com"]
        ];

        $msgData = createMessagePayload($phone, $templateName, $tempLanguage, $headerParameters, $bodyParameters);

        // return $msgData;

        $msg = new InteraktServices();
        $resp = $msg->sendMessage($msgData);
        return response()->json($resp);
    }
    

}
