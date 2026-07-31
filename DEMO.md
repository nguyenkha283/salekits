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

Bố cục ba cột:

| Cột | Nội dung |
|---|---|
| Trái | 11 tab theo mục 5.4 của SRS, kèm nhãn nguồn dữ liệu **DRIVE / IMPORT / NHẬP TAY** và ổ khóa khi vai trò hiện tại không có quyền |
| Giữa | Trang dự án thật, giống hệt trang công khai |
| Phải | Bảng nguồn dữ liệu của tab đang chọn: thư mục Drive tương ứng, cảnh báo ghi đè, nút đồng bộ hoặc import |

Bốn thứ nên chỉ vào:

- **Bộ chọn vai trò** trên thanh đầu, đủ 6 vai trò theo mục 2.4. Đổi sang *Trưởng line* — toàn bộ 11 tab hiện ổ khóa, không sửa được gì, đúng với việc vai trò này chỉ duyệt. Đổi sang *Quản lý giao dịch* — chỉ Mặt bằng, Bảng hàng, Quỹ căn mở ra.
- **Nhãn nguồn dữ liệu** ở rail trái — trả lời trực tiếp câu hỏi PO hay hỏi nhất: dữ liệu tab này ở đâu ra.
- **Cột phải khi chọn tab Drive** — hiện cảnh báo *đồng bộ sẽ ghi đè toàn bộ hình ảnh và tài liệu của tab này*, đúng FR-22.
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
| Rail trái 11 tab | Đúng mục 5.4, kèm nhãn nguồn dữ liệu và trạng thái khóa theo vai trò |
| Đủ 6 vai trò | Trước đây CMS chỉ có 4; nay khớp mục 2.4 của SRS |
| Nối CMS sang trang công khai | Nút **Trang công khai** trong `CmsHeader`, mang theo `projectId` |
| Nội dung Drive hiển thị thật | Khi mở kèm `?projectId=`, tab Tổng quan hiện khối *Nội dung đồng bộ từ Google Drive* |
| **Gỡ toàn bộ link ảnh ngoài** | 9 ảnh vốn hotlink từ `mikland.com.vn` đã chuyển sang ảnh cục bộ trong `public/` |
| **Vá 4 ảnh thiếu** | Bản design tham chiếu 4 file không có trong gói — đã trỏ lại ảnh có sẵn |
| Thống nhất chữ | Toàn hệ dùng **Be Vietnam Pro** thay vì hai bộ chữ khác nhau |
| Dải điều hướng demo | Trên trang chủ, gỡ khi lên bản thật |
| Bổ sung `.env.example` | Trước đây thiếu ba biến backend bắt buộc |

---

## 4. Cần nói trước với PO — những chỗ chưa có

Nếu không nói trước, PO sẽ tưởng đã xong.

**Chưa lưu được nội dung biên tập.** CMS chưa có endpoint ghi. Chỉnh sửa trong phiên hiển thị đúng nhưng tải lại trang là mất. Cột `configuration` chưa bao giờ được ghi vào cơ sở dữ liệu.

**Chưa có đăng nhập.** Bộ chọn vai trò là giả lập để trình diễn phân quyền, chưa gắn HRM. Các endpoint chưa có xác thực — **không đưa bản này lên môi trường truy cập được từ ngoài.**

**Bảng hàng chạy bằng dữ liệu mẫu.** Import từ Google Sheet, sinh mã căn, Bước 2 gán sheet lên mặt bằng đều chưa có. Backend mới chỉ đọc *tên* thư mục Bảng hàng.

**Chưa có phân cấp dự án cha – con** (mục 2.3 của SRS v2.0), chưa có luồng duyệt, nhật ký thao tác và thông báo.

**Mặt bằng chưa có pin.** Bước 1 và Bước 2 (FR-30 đến FR-33) chưa dựng.

Với các phần này, dùng bản prototype HTML gửi kèm trước đó (`CENHOMES-prototype-dot-1.html`) để minh hoạ — nó có sẵn chấm pin, luồng import 5 bước và hộp thoại đồng bộ.

---

## 5. Cấu trúc thư mục

```
api/                          backend serverless — giữ nguyên
  _lib/{driveTree,syncSections,convertContentFile,richTextServer}.ts
  {sync-project,sync-overview,get-project,drive-file}.ts
src/
  detail/                     ← GIAO DIỆN TỪ BẢN DESIGN
    components/               18 component, không sửa logic
    data/inventoryData.ts     dữ liệu bảng hàng mẫu
  pages/
    ProjectDetailPage.tsx     ← file nối mới
    ProjectCreatedPage.tsx    CMS editor
    KhoiTaoDuAnPage.tsx       khởi tạo dự án
  components/                 khung CMS
public/                       13 ảnh cục bộ
supabase/schema.sql
```

---

## 6. Việc nên làm ngay sau buổi demo

1. Chốt một phương án hiển thị ô căn trong bốn phương án đang có.
2. Viết endpoint lưu nội dung — đây là thứ chặn mọi việc còn lại.
3. Thêm xác thực cho cả năm endpoint, và giới hạn `/api/drive-file` chỉ phục vụ file thuộc dự án đã đăng ký.
4. Thiết kế lại lược đồ cơ sở dữ liệu: hiện chỉ có một bảng với hai cột JSON.
