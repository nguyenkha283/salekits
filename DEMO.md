# Prototype demo — Hệ thống quản lý dự án BĐS

Bản hợp nhất: **giao diện** lấy từ bản design trang chi tiết dự án, **luồng và backend** lấy từ bản CMS (`salekits`).

---

## 1. Chạy thử

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

**Không cần cấu hình gì để demo.** Trang chi tiết dự án chạy bằng dữ liệu mẫu dựng sẵn.

Chỉ khi muốn trình diễn cả phần đồng bộ Drive thật mới cần chép `.env.example` thành `.env.local` và điền ba biến server (Google Service Account, Supabase URL, Supabase Service Role Key), kèm chạy `supabase/schema.sql`.

---

## 2. Kịch bản trình bày cho PO (khoảng 12 phút)

Trang chủ có sẵn **dải điều hướng demo** với ba bước theo đúng thứ tự.

### Bước 1 — Khởi tạo dự án · `/khoi-tao-du-an` (2 phút)
Nhập tên dự án, dán link thư mục Drive. Nhấn Tạo dự án.

> Đối chiếu SRS: UC-02, và giả định mục 2.6 rằng nội dung đã nằm sẵn trên Drive theo quy ước thư mục.

### Bước 2 — Biên tập trong CMS · `/hoan-tat` (5 phút)

**CMS dùng đúng template của trang công khai.** Vùng canvas giữa màn hình render cùng một component với `/du-an`, nên cái nhìn thấy khi biên tập chính là cái sẽ xuất bản.

Canvas chiếm trọn chiều rộng, không có cột phụ. Điều hướng giữa 11 tab dùng luôn thanh tab của trang công khai.

**Nút nổi góc dưới bên phải** mở ngăn kéo *Nội dung đồng bộ từ Google Drive*:

- Liệt kê 11 tab kèm **số ảnh và tài liệu đã đồng bộ** vào từng tab; chấm xanh là tab đã có nội dung.
- Mở rộng tab đang chọn để xem **đúng thư mục Drive nguồn** của từng nhóm ảnh.
- Nút **Đồng bộ lại từ Drive** kèm cảnh báo ghi đè theo FR-22, và liên kết mở thẳng thư mục Drive.
- Huy hiệu trên nút hiển thị tổng số mục đã đồng bộ.

### Bấm vào section để sửa

Trong CMS, di chuột lên trang sẽ thấy **viền cam và nhãn tên section**. Bấm vào là section được chọn (viền đậm) và ngăn kéo chuyển sang chế độ sửa:

**Chữ sửa thẳng trên trang, không qua hộp thoại.** Bấm vào bất kỳ khối chữ nào là con trỏ hiện ra gõ luôn như trong Word. Với khối văn bản dài, thanh Đậm / Nghiêng / Danh sách / Xóa định dạng nổi lên ngay phía trên khối đang nhập.

Sáu khối sửa được tại chỗ: cấp độ dự án (dropdown), tên dự án, slogan, mô tả tổng quan, mô tả vị trí, và ba cặp số liệu nổi bật.

| Loại section | Sửa được gì |
|---|---|
| **Từ Drive** — ảnh hero, tiện ích, mặt bằng, 360, tiến độ, tài liệu, chính sách | Xem ảnh đang có, tên thư mục nguồn, nút đồng bộ lại. Không sửa tay được — đúng quy định của SRS |
| **Đợt sau** — loại hình sản phẩm, liên hệ | Hiện ghi chú, chưa có giao diện biên tập |

Nút **Trả về gốc** ở chân ngăn kéo hoàn tác mọi chỉnh sửa trong phiên.

Các thành phần tương tác vẫn hoạt động bình thường khi đang biên tập — bấm mũi tên băng ảnh vẫn chuyển ảnh, bấm ô tiện ích vẫn mở lightbox. Muốn chọn section thì bấm vào vùng trống của nó.

Đổi vai trò sang **Trưởng line** thì viền chuyển xám và bấm vào chỉ hiện thông báo không có quyền.

Ba thứ nên chỉ vào:

- **Bộ chọn vai trò** trên thanh đầu, đủ 6 vai trò theo mục 2.4. Đổi sang *Trưởng line* — thanh trên báo không sửa được tab nào, đúng với việc vai trò này chỉ duyệt. Đổi sang *Quản lý giao dịch* — chỉ Mặt bằng, Bảng hàng, Quỹ căn mở ra.
- **Bấm vào khối *Tổng quan dự án*** rồi gõ vài chữ trong ngăn kéo — chữ trên trang đổi ngay.
- **Nút Đồng bộ lại** — ảnh từ Drive chảy thẳng vào đúng section, xem mục 4 bên dưới.
- **Cấu hình dự án** (bánh răng) — mã dự án, địa giới, đội ngũ, SEO, trạng thái xuất bản.

Trình biên tập cũ vẫn còn ở `/hoan-tat-cu` nếu cần đối chiếu.

### Bước 3 — Trang chi tiết dự án · `/du-an` (6 phút)
Từ CMS bấm **Trang công khai** ở thanh trên, hoặc vào thẳng `/du-an`.

Đây là phần nặng nhất, nên dành thời gian cho ba tab:

- **Bảng hàng** — lưới tầng × trục, bốn tình trạng căn, hai quỹ độc quyền/chéo, lọc theo tình trạng, bấm ô mở chi tiết căn. Bốn nút *Tòa 1–4* hiện đang là **bốn phương án hiển thị khác nhau** để chọn, không phải bốn tòa nhà — cần PO chốt một phương án.
- **Quỹ căn** — bảng phẳng gộp toàn dự án, chọn nhiều căn.
- **Mặt bằng** — hai chế độ bản đồ vệ tinh và ảnh tĩnh.

---

## 3. Những gì đã thay đổi so với hai bản gốc

| Việc | Chi tiết |
|---|---|
| Đưa toàn bộ giao diện bản design vào | 18 component đặt tại `src/detail/components/`, giữ nguyên không sửa logic |
| Thêm trang `/du-an` | `src/pages/ProjectDetailPage.tsx` — bản App của design, có nối dữ liệu CMS |
| **CMS dùng chung template** | `src/detail/ProjectCanvas.tsx` — canvas dùng chung; `/hoan-tat` và `/du-an` render cùng một component |
| **Trang CMS mới** | `src/pages/ProjectCmsPage.tsx` — vỏ CMS ba cột theo bảng màu bản design |
| **Đồng bộ ảnh vào đúng tab** | `src/detail/syncedMedia.ts` ánh xạ thư mục Drive → tab; `SyncedGallery.tsx` hiển thị |
| Nút nổi kiểu GitBook | Góc dưới phải, mở ngăn kéo *Nội dung đồng bộ từ Google Drive* |
| Đủ 6 vai trò | Trước đây CMS chỉ có 4; nay khớp mục 2.4 của SRS |
| Nối CMS sang trang công khai | Nút **Trang công khai** trong `CmsHeader`, mang theo `projectId` |
| Nội dung Drive hiển thị thật | Khi mở kèm `?projectId=`, tab Tổng quan hiện khối *Nội dung đồng bộ từ Google Drive* |
| **Gỡ toàn bộ link ảnh ngoài** | 9 ảnh vốn hotlink từ `mikland.com.vn` đã chuyển sang ảnh cục bộ trong `public/` |
| **Vá 4 ảnh thiếu** | Bản design tham chiếu 4 file không có trong gói — đã trỏ lại ảnh có sẵn |
| Thống nhất chữ | Toàn hệ dùng **Be Vietnam Pro** thay vì hai bộ chữ khác nhau |
| Dải điều hướng demo | Trên trang chủ, gỡ khi lên bản thật |
| Bổ sung `.env.example` | Trước đây thiếu ba biến backend bắt buộc |

---

## 4. Đồng bộ ảnh từ Drive vào các tab

Bấm **Đồng bộ lại** (thanh trên hoặc trong ngăn kéo). Hệ thống đọc thư mục Drive của dự án và phân ảnh về đúng tab theo bảng sau:

| Thư mục Drive | Tab nhận | Ghi chú |
|---|---|---|
| `01. Tổng quan / Ảnh hero banner` | Tổng quan | Ảnh đầu trang |
| `01. Tổng quan / Ảnh tổng quan` | Tổng quan | |
| `01. Tổng quan / Vị trí` | Tổng quan | Kèm nội dung văn bản vị trí |
| `01. Tổng quan / Ảnh tiện ích` | Tổng quan | File `.txt` cùng tên trở thành chú thích ảnh |
| `01. Tổng quan / Ảnh mặt bằng` | Tổng quan | Ảnh xem nhanh, tên file thành nhãn |
| `02. Đào tạo` | Đào tạo | |
| `03. Mặt bằng` | Mặt bằng | Lấy ảnh đầu tiên |
| `04. Ảnh 360` | Ảnh 360 | |
| `05. Chính sách bán hàng` | Chính sách bán hàng | Ảnh đầu là ảnh bìa, mỗi thư mục con là một nhóm |
| `06. Tiến độ` | Tiến độ | |
| `07. Tài liệu` | Tài liệu | |
| `Banner dọc` | Tổng quan | `banner-trai`, `banner-phai` |

**Dữ liệu Drive chảy thẳng vào đúng section đã thiết kế**, không nằm ở khối riêng. Cụ thể:

| Section trên trang | Nhận dữ liệu từ |
|---|---|
| Băng ảnh đầu trang (hero carousel) | `Ảnh hero banner` |
| Ảnh và mô tả khối *Tổng quan dự án* | `Ảnh tổng quan` + `Nội dung tổng quan.docx` |
| Ảnh và mô tả khối *Vị trí dự án* | `Vị trí/` (ảnh + `Nội dung vị trí.docx`) |
| Lưới mosaic *Tiện ích* + lightbox | `Ảnh tiện ích` (file `.txt` cùng tên thành chú thích) |
| Tab mặt bằng xem nhanh trong Tổng quan | `Ảnh mặt bằng` (tên file thành nhãn tab) |
| Ảnh mặt bằng tĩnh, tab Mặt bằng | `03. Mặt bằng` |
| Danh sách cảnh trong trình xem 360 | `04. Ảnh 360` (tên file thành tên cảnh) |
| Ảnh bìa + nhóm file, tab Chính sách | `05. Chính sách bán hàng` |
| Thư viện ảnh có phân trang, tab Tiến độ | `06. Tiến độ` |
| Lưới 12 ô, tab Tài liệu | `07. Tài liệu` |
| Danh sách file, tab Đào tạo | `02. Đào tạo` |

Mục nào Drive chưa có thì section đó tự động giữ dữ liệu mẫu, nên trang không bao giờ trống.

Trang công khai `/du-an?projectId=...` dùng chung dữ liệu này, nên biên tập xong xem trước là thấy đúng ảnh vừa đồng bộ.

---

## 5. Nén ảnh tự động

Mọi ảnh đi qua `/api/drive-file` giờ nhận thêm tham số bề rộng, ví dụ `?w=640`. Endpoint lấy bản **đã resize sẵn của Google** thay vì tải file gốc:

| Ngữ cảnh | Bề rộng |
|---|---|
| Ảnh thu nhỏ trong ngăn kéo CMS | 160 px |
| Ảnh tiện ích, ảnh tiến độ | 640 px |
| Ảnh tổng quan, bản đồ vị trí, ảnh bìa chính sách | 1280 px |
| Băng ảnh đầu trang, mặt bằng, ảnh 360 | 1600 px |

Cách này không cần thư viện xử lý ảnh, không tốn CPU của hàm serverless, và Google đã dựng sẵn các kích thước đó cho mọi ảnh trên Drive. Bề rộng chỉ nhận bảy giá trị định sẵn để tránh phân mảnh cache. Nếu Google không trả được bản resize thì tự động rơi về file gốc.

Cache nâng từ 1 giờ lên 24 giờ kèm `stale-while-revalidate` 7 ngày. Header `X-Image-Variant` cho biết đang phục vụ bản nào — tiện khi cần kiểm tra.

---

## 6. Cần nói trước với PO — những chỗ chưa có

Nếu không nói trước, PO sẽ tưởng đã xong.

**Chưa lưu được nội dung biên tập.** CMS chưa có endpoint ghi. Chỉnh sửa trong phiên hiển thị đúng nhưng tải lại trang là mất. Cột `configuration` chưa bao giờ được ghi vào cơ sở dữ liệu.

**Chưa có đăng nhập.** Bộ chọn vai trò là giả lập để trình diễn phân quyền, chưa gắn HRM. Các endpoint chưa có xác thực — **không đưa bản này lên môi trường truy cập được từ ngoài.**

**Bảng hàng chạy bằng dữ liệu mẫu.** Import từ Google Sheet, sinh mã căn, Bước 2 gán sheet lên mặt bằng đều chưa có. Backend mới chỉ đọc *tên* thư mục Bảng hàng.

**Chưa có phân cấp dự án cha – con** (mục 2.3 của SRS v2.0), chưa có luồng duyệt, nhật ký thao tác và thông báo.

**Mặt bằng chưa có pin.** Bước 1 và Bước 2 (FR-30 đến FR-33) chưa dựng.

Với các phần này, dùng bản prototype HTML gửi kèm trước đó (`CENHOMES-prototype-dot-1.html`) để minh hoạ — nó có sẵn chấm pin, luồng import 5 bước và hộp thoại đồng bộ.

---

## 7. Cấu trúc thư mục

```
api/                          backend serverless — giữ nguyên
  _lib/{driveTree,syncSections,convertContentFile,richTextServer}.ts
  {sync-project,sync-overview,get-project,drive-file}.ts
src/
  detail/                     ← GIAO DIỆN TỪ BẢN DESIGN
    ProjectCanvas.tsx         canvas dùng chung CMS + trang công khai
    syncedMedia.ts            ánh xạ thư mục Drive → tab
    components/               18 component gốc + SyncedGallery
    data/inventoryData.ts     dữ liệu bảng hàng mẫu
  pages/
    ProjectDetailPage.tsx     trang công khai
    ProjectCmsPage.tsx        ← trang CMS mới
    ProjectCreatedPage.tsx    CMS editor
    KhoiTaoDuAnPage.tsx       khởi tạo dự án
  components/                 khung CMS
public/                       13 ảnh cục bộ
supabase/schema.sql
```

---

## 8. Việc nên làm ngay sau buổi demo

1. Chốt một phương án hiển thị ô căn trong bốn phương án đang có.
2. Viết endpoint lưu nội dung — đây là thứ chặn mọi việc còn lại.
3. Thêm xác thực cho cả năm endpoint, và giới hạn `/api/drive-file` chỉ phục vụ file thuộc dự án đã đăng ký.
4. Thiết kế lại lược đồ cơ sở dữ liệu: hiện chỉ có một bảng với hai cột JSON.
