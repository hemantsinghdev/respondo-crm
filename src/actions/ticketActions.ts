"use server";

type TPayload = {
  userId: string;
  requestBody: {
    subject: string;
    body: string;
    to: {
      name: string;
      email: string;
    }[];
    reply_to_message_id: string;
  };
};

export const sendReply: (
  payload: TPayload
) => Promise<{ success: boolean }> = async (payload: TPayload) => {
  console.log("[NYLAS REPLY] Request received");
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/nylas/send-reply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "[NYLAS REPLY] API Error:",
        response.status,
        errorData.error
      );
      return { success: false };
    }
    console.log("[NYLAS REPLY] Reply Sent");
    return { success: true };
  } catch (e) {
    console.error("[NYLAS REPLY] Network or Unexpected Error:", e);
    return { success: false };
  }
};
