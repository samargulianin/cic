# CIC enquiry automation (n8n)

When a visitor submits the enquiry form on the One World / CIC site, the Payload
`Enquiries.afterChange` hook POSTs the new lead to an n8n **Webhook**. The workflow
then:

1. **Appends a row to a Google Sheet** (lead log).
2. **Sends the enquirer an automatic WhatsApp message** via the Meta WhatsApp Cloud
   API (only when a phone number is present), in the language they submitted in.

Workflow file: `cic-enquiry-whatsapp-sheets.json` — import it via **n8n → Workflows
→ Import from File**.

## Flow

```
Webhook (POST /cic-enquiry)
   └─ Normalize (Code: secret check + E.164 phone + pick ka/en template)
        ├─ Respond to Webhook (200 {ok:true})   ← answers the site fast
        ├─ Append to Google Sheet
        └─ Has phone?  ──true──▶ Send WhatsApp message (template)
```

## Setup — replace every placeholder before activating

| Placeholder | Where | What to set |
|---|---|---|
| `REPLACE_WITH_WEBHOOK_SECRET` | Normalize node (`EXPECTED_SECRET`) | The same value as the site's `N8N_WEBHOOK_SECRET`. The node checks the `x-n8n-secret` header and rejects mismatches. **Left as-is, the check is skipped** — handy for testing, but set it before going live. |
| `YOUR_SPREADSHEET_ID` | Append to Google Sheet | The spreadsheet ID from the sheet URL (`docs.google.com/spreadsheets/d/<ID>/edit`). |
| `REPLACE_WITH_GOOGLE_SHEETS_CREDENTIAL_ID` | Append to Google Sheet | A **Google Sheets OAuth2** credential (connect your Google account in n8n). |
| `YOUR_WHATSAPP_PHONE_NUMBER_ID` | Send WhatsApp message | Your WhatsApp **Phone Number ID** from Meta Business. |
| `REPLACE_WITH_WHATSAPP_CLOUD_CREDENTIAL_ID` | Send WhatsApp message | A **WhatsApp Cloud API** credential (permanent access token). |

> **Webhook security:** the endpoint itself is open at the n8n layer, but the
> **Normalize** node enforces a shared secret — set `EXPECTED_SECRET` to match the
> site's `N8N_WEBHOOK_SECRET` and requests without the correct `x-n8n-secret`
> header are rejected. Keep the two values in sync.

### 1. Google Sheet
Create a new sheet with a tab named **`Enquiries`** and a header row:

```
Timestamp | Name | Email | Phone | Field of interest | Study level | Preferred contact | Message | Source | Locale
```

Put its ID in the node and connect the Google Sheets OAuth2 credential.

### 2. WhatsApp Cloud API (Meta)
Business-initiated messages **must use a pre-approved template** — you cannot send
free text to a user who hasn't messaged you in the last 24h. In Meta Business
Manager → WhatsApp Manager → Message Templates, create **two** templates, each with
a single body parameter `{{1}}` (the enquirer's name):

- `enquiry_ack_ka` — language **Georgian (ka)**
- `enquiry_ack_en` — language **English (US) (en_US)**

Example body (`enquiry_ack_ka`):
> გამარჯობა {{1}}, მადლობა One World-თან დაკავშირებისთვის. ჩვენი გუნდი მალე დაგიკავშირდებათ.

Example body (`enquiry_ack_en`):
> Hello {{1}}, thank you for contacting One World. Our team will reach out to you shortly.

The **Normalize** node picks the template name + language code from the submission
`locale`. If you rename the templates, update that node.

> **Verify after import:** open the *Send WhatsApp message* node and confirm the
> template + body-parameter mapping loaded correctly (the exact field layout can
> vary between n8n versions). It should map body `{{1}}` → `{{ $json.name }}`.

## Wiring the website to n8n

The site sends the lead from `src/collections/Enquiries.ts` (`afterChange`) when
these env vars are set (see `web/.env.example`):

```
N8N_ENQUIRY_WEBHOOK_URL=https://<your-n8n-host>/webhook/cic-enquiry
N8N_WEBHOOK_SECRET=<same value as the Header Auth credential>
```

If `N8N_ENQUIRY_WEBHOOK_URL` is unset, the site skips the call entirely — dev works
without n8n.

## Test

Activate the workflow, then:

```bash
curl -X POST 'https://<your-n8n-host>/webhook/cic-enquiry' \
  -H 'x-n8n-secret: <secret>' \
  -H 'content-type: application/json' \
  -d '{"name":"Test","email":"t@x.com","phone":"555123456","locale":"ka","source":"homepage"}'
```

Expect `{"ok":true}`, a new row in the sheet, and (with real WhatsApp creds +
approved template) a WhatsApp message to **+995555123456**.
