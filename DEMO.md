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

### Bước 2 — Biên tập trong CMS · `/hoan-tat` (4 phút)
Ba thứ nên chỉ vào:

- **Bộ chọn vai trò** giữa thanh trên. Đổi sang *Trưởng line* — toàn bộ vùng biên tập khóa lại. Đổi sang *Quản lý bán hàng* — chỉ mở Mặt bằng, Bảng hàng, Quỹ căn. Đây là ma trận phân quyền mục 2.5 chạy thật.
- **Nút Đồng bộ lại** — đọc lại toàn bộ nội dung từ thư mục Drive.
- **Cấu hình dự án** (biểu tượng bánh răng) — mã dự án, địa giới, đội ngũ, SEO, trạng thái xuất bản.

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
