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

Thanh trên có **icon chuông** hiển thị thông báo theo UC-21: yêu cầu chỉnh sửa từ Trưởng line, kết quả đồng bộ Drive, cập nhật bảng hàng.

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

Mục nào Drive chưa có thì section đó tự động giữ dữ liệu mẫu, nên trang không bao giờ trống.

Trang công khai `/du-an?projectId=...` dùng chung dữ liệu này, nên biên tập xong xem trước là thấy đúng ảnh vừa đồng bộ.

### Nhập bảng hàng

Dự án mới chưa có bảng hàng, nên ba tab **Sản phẩm**, **Bảng hàng** và **Quỹ căn** hiện màn nhập nguồn dữ liệu thay vì bảng: một ô dán liên kết Google Sheet, hoặc vùng tải file Excel.

Bấm **Đọc file** → hệ thống bóc tách sheet → **popup chọn sheet** hiện ra để phân loại từng sheet thành *Bảng hàng*, *Quỹ căn* hoặc *Bỏ qua*. Xác nhận xong ba tab mới hiển thị dữ liệu đầy đủ.

**Toàn bộ dữ liệu bảng hàng đến từ file bạn nhập — không còn dữ liệu mẫu nào.**

- **Tải file .xlsx** — đọc trực tiếp trong trình duyệt bằng SheetJS
- **Dán liên kết Google Sheet** — đọc qua `/api/read-sheet` bằng **Google Sheets API**

Sheets API là đường chính vì nó đọc được cả file **bị chặn tải xuống** — chặn tải xuống chỉ giới hạn ở giao diện, không giới hạn quyền đọc dữ liệu. Điều kiện duy nhất là link đặt "Bất kỳ ai có liên kết — Người xem", hoặc file được chia sẻ cho địa chỉ service account.

Đường này còn lấy được hai thứ mà xuất file không có:

| | Dùng để làm gì |
|---|---|
| **Ô gộp** | Tự phát hiện penthouse thông tầng và duplex thông căn, gộp sẵn trên lưới |
| **Dòng ẩn** | Loại bỏ, để dữ liệu nhập vào khớp với những gì QLGD nhìn thấy |

Nếu Sheets API chưa bật, hệ thống tự rơi xuống xuất file `.xlsx` qua Drive và báo rõ là mất thông tin ô gộp.

Bộ phân tích tự dò, không giả định vị trí cột hay dòng:

| Việc | Cách làm |
|---|---|
| Dòng tiêu đề | Chấm điểm 20 dòng đầu, chọn dòng khớp nhiều tên cột nhất; tiêu đề trải 1–3 dòng đều nhận được |
| Tên cột | So khớp bỏ dấu, không phân biệt hoa thường — `Mã căn hộ`, `TRỤC / Tòa`, `Diện tích thông thủy (m2)`… |
| Cột giá | Nhận theo từ khoá (`TGT`, `Tổng giá trị`, `VNĐ`…), **số cột tùy file** |
| Nhóm giá | Lấy từ dòng banner gộp ô phía trên, ví dụ *Chính sách ổn định lãi suất* |
| Số tiền | `5,432,422,100` và `5.432.422.100` đều đúng; `65.27` hiểu là thập phân |
| Tình trạng | Ô trống → Còn hàng; `LOCK`, `ĐẶT CỌC`, `Giữ chỗ`, `Đã ký HĐMB`… đều quy đổi |
| Dòng rác | Bỏ dòng trống, dòng tiêu đề lặp giữa file, dòng trùng mã căn |
| Cột lạ | Giữ nguyên, hiện trong popup chi tiết căn ở mục *Cột khác trong file* |

Popup chọn sheet hiện **kết quả nhận diện của từng sheet**: số căn đọc được, các trường đã ánh xạ, số cột giá. Nhìn là biết ngay sheet nào đọc đúng.

Bộ chọn loại giá sinh động theo số cột giá thật trong file, gom theo đúng nhóm của file.

### Soạn thảo lưới bảng hàng

Bảng hàng luôn có đủ **sáu dòng tiêu đề**: TẦNG/CĂN, LOẠI HÌNH, HƯỚNG, DT THÔNG THỦY, DT TIM TƯỜNG, VIEW. Dòng nào file không có dữ liệu thì để trống — bấm vào ô là điền được ngay.

| Thao tác | Cách làm |
|---|---|
| Sửa ô tiêu đề | Bấm vào ô, gõ trực tiếp |
| **Gộp ô** | Bôi đen các ô rồi bấm **chuột phải** → *Gộp ô*. Dùng cho VIEW chung nhiều trục |
| Tách ô | Chuột phải lên ô đã gộp → *Tách ô* |
| Không có chuột | Chạm giữ 0,5 giây trên máy cảm ứng; hoặc `Shift`+mũi tên rồi `Ctrl`+`M`; hoặc hai nút trên thanh công cụ |
| Thêm trục căn | Nút `+` ở cuối dòng trục |
| Xóa trục | Biểu tượng thùng rác cạnh tên trục |
| Thêm tầng | Nút **Thêm tầng** cuối mỗi khối |
| **Thêm khối** | Nút cuối bảng — dựng khối mới có đủ sáu dòng tiêu đề và cấu trúc trục riêng, dùng cho **penthouse** (thông tầng) và **duplex** (thông căn) ở các tầng trên cùng |

Thang tầng và thang căn sinh **đầy đủ từ 1 tới giá trị lớn nhất** trong file, xếp tăng dần. Tầng đặc biệt như `8A`, `06A`, `12A` giữ đúng vị trí ngay sau tầng cùng số. Số căn suy được từ mã căn khi file không có cột riêng.

Gộp ô xử lý đúng cả khi vùng chọn chồng lên ô đã gộp sẵn — hệ thống tự nới ra hết ranh giới thay vì cắt đôi. Thêm hoặc xóa trục ở giữa vùng gộp cũng tự điều chỉnh độ phủ.

Trang công khai hiển thị cùng lưới đó ở chế độ chỉ xem.

Chặn xác nhận nếu chưa chọn sheet Bảng hàng nào.

### Theo dõi thay đổi từ chủ đầu tư

Khi nguồn bảng hàng là link Google Sheet, hệ thống **tự kiểm tra mỗi 5 phút** xem chủ đầu tư đã sửa file chưa — chỉ đọc metadata nên rất nhẹ. Chạy ở cấp trang nên nhận được thông báo kể cả khi đang ở tab khác.

Phát hiện thay đổi thì: đẩy thông báo vào **chuông** trên thanh đầu, hiện huy hiệu cam trên thanh nguồn, và nút Đồng bộ lại chuyển sang màu cam.

Bấm đồng bộ lại sẽ hiện **màn so khác biệt** trước khi ghi đè: căn mới bổ sung, căn bị gỡ, và từng căn đổi thông tin với giá trị cũ gạch ngang. Hai nút *Để sau* hoặc *Áp dụng thay đổi* — không có đường nào tự ghi đè.

**Ngưỡng an toàn:** nếu hơn 30% số căn bị ảnh hưởng (và tổng trên 20 căn), hệ thống chặn áp dụng và cảnh báo — mức đó thường do chủ đầu tư đổi cấu trúc file khiến ánh xạ cột lệch, chứ hiếm khi là thay đổi kinh doanh thật. Muốn áp vẫn được, nhưng phải tích ô xác nhận.

**Mất quyền truy cập:** ba lần kiểm tra thất bại liên tiếp thì báo *"Mất quyền đọc file nguồn"* — tránh để đồng bộ hỏng âm thầm hàng tuần.

### Đồng bộ lại bảng hàng

Bảng hàng **không nằm trong thư mục Drive chung của dự án**, nên nó có nút đồng bộ riêng thay vì dùng nút *Đồng bộ lại* trên thanh đầu.

Trong CMS, ba tab bảng hàng có **thanh nguồn dữ liệu** ở đầu trang: loại nguồn, đường dẫn, số sheet đã nhập, thời điểm đồng bộ gần nhất, liên kết mở file gốc, và nút **Đồng bộ lại bảng hàng**.

Bấm nút này đi qua ba bước: **cảnh báo ghi đè** (nêu rõ dữ liệu bị thay thế, căn không còn trong file mới sẽ bị gỡ, thay đổi thủ công không được giữ, file cũ vẫn lưu để khôi phục) → **chọn nguồn mới** → **chọn lại sheet**. Không thể bỏ qua bước cảnh báo.

Thanh nguồn chỉ hiện với vai trò có quyền sửa; trang công khai không thấy.

### Menu và vai trò

Menu 11 mục: Tổng quan · **Sản phẩm** · **Mặt bằng quỹ căn** · Bảng hàng · Quỹ căn · Ảnh 360 · CSBH · Tiến độ · Tài liệu · Tin tức · **Đội ngũ**.

Vai trò **User khác** không thấy mục Đội ngũ và không sửa được nội dung nào — dùng để minh hoạ người dùng nội bộ ngoài đội dự án.

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
