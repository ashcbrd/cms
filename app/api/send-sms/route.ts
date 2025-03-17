import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = "AC8cca343a0750d06b7990a6457fee3a92";
const authToken = "793f818ca26736fe38ea059c90f61cc6";
const twilioPhoneNumber = "+15103720727";

const client = twilio(accountSid, authToken);

interface SendSmsRequest {
  to: string;
  body: string;
}

export async function POST(request: Request) {
  try {
    const { to, body }: SendSmsRequest = await request.json();

    const message = await client.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to,
    });

    return NextResponse.json(
      { message: "SMS sent successfully", sid: message.sid },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to send SMS", error: error.message },
      { status: 500 }
    );
  }
}
