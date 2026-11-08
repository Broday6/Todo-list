# Send Teams replies from Ultron with your own Power Automate flow (no IT, no API key)

Why: the Microsoft 365 connector can't send Teams messages because your company hasn't granted it the "ChatMessage.Send" permission, and only IT can. A flow on your own account can post as you.

How it works: when you double-tap **Send in Teams** on the board, the board emails the reply **to you only** with the subject `ULTRON-TEAMS <chat id>`. Your flow sees that email, posts the text into that Teams chat as you, and tidies the email away. Nothing is sent unless you double-tap.

## Build it (about 10 minutes)

1. Go to **make.powerautomate.com** and sign in with your work account.
2. **+ Create → Automated cloud flow.** Name it `Ultron Teams send`. Pick the trigger **When a new email arrives (V3)** (Office 365 Outlook) and press **Create**.
3. In the trigger, set:
   - **Folder:** Inbox
   - **Subject Filter:** `ULTRON-TEAMS`
   - Show advanced options → **From:** your own email address (so only the board's emails trigger it)
   - **Include Attachments:** No
4. **+ New step →** search **Post message in a chat or channel** (Microsoft Teams). Set:
   - **Post as:** User
   - **Post in:** Group chat
   - **Group chat:** choose **Enter custom value**, then the **Expression** tab, paste this and press OK:
     `trim(replace(triggerOutputs()?['body/subject'],'ULTRON-TEAMS',''))`
   - **Message:** pick **Body** from the dynamic content of the email.
5. **+ New step →** **Move email (V2)** (Office 365 Outlook). **Message Id:** pick **Message Id** from the trigger. **Folder:** Deleted Items (or make an `Ultron sent` folder).
6. **Save.**

## Test it

1. On Ultron open **Control room › Sources** and tick **I set this up** on "Send Teams replies (Power Automate)".
2. On a Teams card that has a reply, press **Send in Teams**, then tap again.
3. Check the chat in Teams within a minute. If it posted, you're done.

If the test fails on a one-to-one chat (some tenants only allow group chats in that action), untick the source; the board goes back to **Reply in Teams** (copy, open the chat, paste).

## The permanent fix (optional, needs IT)

Ask IT to grant admin consent for the Claude Microsoft 365 connector (client id `07c030f6-5743-41b7-ba00-0a6e85f37c17`) in Microsoft Entra admin center → Enterprise applications → that app → Permissions → Grant admin consent, so it includes **ChatMessage.Send**. Then Send in Teams can post directly.
