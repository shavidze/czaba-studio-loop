---


# Support Chat

### **დავალება: Live Support Chat სისტემის იმპლემენტაცია**

**User Story:**

**As a** ვებსაიტის ვიზიტორი (Guest ან რეგისტრირებული მომხმარებელი),
**I want to** რეალურ დროში დავუკავშირდე Support-ს ჩათის საშუალებით საიტზე არსებული widget-ით,
**So that** სწრაფად მივიღო პასუხი ჩემს კითხვებზე შეძენამდე ან შემდეგ, ელფოსტის მოლოდინის გარეშე.

---

### **ტექნიკური სპეციფიკაცია:**

| კომპონენტი | ტექნოლოგია |
|------------|------------|
| Real-time messaging | **SignalR** (.NET Hub) |
| Push Notifications | **Firebase Cloud Messaging** |
| მონაცემთა ბაზა | **MSSQL** |
| ისტორიის retention | **6 თვე** |

---

### **ფუნქციონალის მოთხოვნები:**

**1. მომხმარებლის მხარე (Store Frontend):**

- **ჩათის ღილაკი:**
    - საიტის ყველა გვერდზე ჩანს floating ჩათის ღილაკი (ქვედა მარჯვენა კუთხე)
    - ღილაკზე დაჭერისას იხსნება ჩათის widget

- **Guest მომხმარებელი:**
    - ჩათის დაწყებამდე უნდა შეიყვანოს სახელი და email
    - Session-ის დასრულებისას ისტორია იკარგება

- **რეგისტრირებული მომხმარებელი:**
    - პირდაპირ იწყებს ჩათს (სახელი/email ავტომატურად)
    - ხედავს წინა საუბრების ისტორიას

- **შეტყობინების გაგზავნა:**
    - ტექსტის აკრეფა და გაგზავნა Enter-ით ან ღილაკით
    - გაგზავნის შემდეგ ჩანს "გაგზავნილია" სტატუსი
    - ადმინის პასუხი ჩანს რეალურ დროში

- **Typing indicator:**
    - როცა ადმინი წერს, მომხმარებელი ხედავს "ოპერატორი წერს..."

- **Offline სცენარი:**
    - თუ ადმინი offline-ია: "გაგზავნეთ შეტყობინება, გიპასუხებთ მალე"
    - შეტყობინება მაინც იგზავნება და ელოდება პასუხს

**2. ადმინის მხარე (Admin Panel):**

- **ჩათის სექცია:**
    - Admin Panel-ში არის "Support Chat" სექცია
    - მარცხენა პანელი: აქტიური ჩათების სია
    - მარჯვენა პანელი: არჩეული ჩათის დიალოგი

- **ჩათის სია:**
    - ჩანს მომხმარებლის სახელი და ბოლო შეტყობინების preview
    - წაუკითხავი შეტყობინებები მონიშნულია (badge)
    - სორტირება: ახალი შეტყობინებები ზემოთ

- **დიალოგის ფანჯარა:**
    - ჩანს მომხმარებლის სახელი, email
    - ჩანს გვერდის URL საიდანაც მომწერა
    - სრული საუბრის ისტორია

- **Canned Responses (მზა პასუხები):**
    - ღილაკი/dropdown მზა პასუხების ასარჩევად
    - მაგალითები:
        - "გმადლობთ შეკითხვისთვის! მალე გიპასუხებთ."
        - "გთხოვთ მიუთითოთ შეკვეთის ნომერი."
        - "თქვენი შეკვეთა წარმატებით გაიგზავნა!"

- **Notifications:**
    - ახალი შეტყობინებისას: browser notification
    - Sound alert

- **ჩათის დახურვა:**
    - ადმინს შეუძლია ჩათის დახურვა/არქივირება
    - დახურული ჩათები ცალკე tab-ში

---

### **მონაცემთა მოდელი:**

```sql
-- ჩათის სესია
CREATE TABLE ChatSession (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT NULL,                    -- NULL = Guest
    GuestName NVARCHAR(100) NULL,
    GuestEmail NVARCHAR(255) NULL,
    PageUrl NVARCHAR(500),              -- საიდან დაიწყო ჩათი
    Status NVARCHAR(20) DEFAULT 'Active', -- Active, Closed
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    ClosedAt DATETIME2 NULL
);

-- შეტყობინებები
CREATE TABLE ChatMessage (
    Id INT PRIMARY KEY IDENTITY,
    SessionId INT FOREIGN KEY REFERENCES ChatSession(Id),
    SenderType NVARCHAR(10),            -- 'User' | 'Admin'
    Message NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- მზა პასუხები
CREATE TABLE CannedResponse (
    Id INT PRIMARY KEY IDENTITY,
    Title NVARCHAR(100),
    Message NVARCHAR(MAX),
    SortOrder INT
);
```

---

### **API Endpoints:**

```
POST   /api/chat/sessions              -- ახალი ჩათის დაწყება
GET    /api/chat/sessions              -- ადმინი: ყველა აქტიური ჩათი
GET    /api/chat/sessions/{id}         -- კონკრეტული ჩათის ისტორია
POST   /api/chat/sessions/{id}/messages -- შეტყობინების გაგზავნა
PATCH  /api/chat/sessions/{id}/close   -- ჩათის დახურვა
GET    /api/chat/canned-responses      -- მზა პასუხების სია
```

---

### **SignalR Hub:**

```csharp
public class ChatHub : Hub
{
    // მომხმარებელი უერთდება ჩათს
    Task JoinSession(int sessionId);

    // ადმინი უერთდება ყველა აქტიურ ჩათს
    Task JoinAdminRoom();

    // შეტყობინების გაგზავნა
    Task SendMessage(int sessionId, string message);

    // Typing indicator
    Task StartTyping(int sessionId);
    Task StopTyping(int sessionId);
}
```

---

### **არ შედის V1-ში (მომავალი):**

- ❌ Read receipts ("წაკითხულია" სტატუსი)
- ❌ ფაილების/სკრინშოტების გაგზავნა
- ❌ Mobile push notifications
- ❌ AI auto-responses

---

