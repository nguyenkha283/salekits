# Đề xuất cập nhật SRS v2.0 → v3.0

**Gửi:** BA · **Từ:** Nhóm phát triển · **Ngày:** 03/08/2026

**Bối cảnh:** tổng hợp sau khi dựng prototype và làm việc với **4 file bảng hàng thật** (Imperia Sky Park, Alumi, Cao tầng Op1 dạng lưới, và file Google Sheet đang bị chủ đầu tư khóa tải xuống). Nhiều giả định trong SRS v2.0 không khớp với dữ liệu thực tế.

Mức độ: 🔴 chặn phát triển · 🟠 cần chốt trước khi lập trình · 🟡 làm rõ khi thuận tiện

---

## Phần 1 — Quy chuẩn cách gọi

Đề nghị bổ sung vào mục Thuật ngữ. Hiện SRS dùng lẫn lộn "bảng hàng" và "quỹ căn", gây hiểu nhầm nhiều lần trong quá trình phân tích.

| Thuật ngữ | Định nghĩa |
|---|---|
| **Bảng hàng** | File hoặc link dữ liệu gốc do chủ đầu tư gửi. Chứa **toàn bộ căn** của tòa, kể cả căn đã bán |
| **Quỹ căn** | Tập con của bảng hàng, phân theo quyền bán: quỹ độc quyền, quỹ chéo, quỹ chung. Đóng vai trò **bộ lọc**, không phải nguồn dữ liệu độc lập |
| **Sheet quỹ** | Sheet do QLGD duy trì, đóng vai trò cơ sở dữ liệu căn: đổi tình trạng, bổ sung căn mới |
| **QLGD** | Quản lý giao dịch — người trực tiếp đưa bảng hàng lên hệ thống |

**Vì sao quan trọng:** độ phủ dữ liệu của hai loại này khác nhau tới 50 lần (bảng hàng ~100%, quỹ căn 2–10%), dẫn tới hai luồng xử lý hoàn toàn khác.

---

## Phần 2 — Mô hình dữ liệu bảng hàng

### 🔴 2.1. Mã căn: hệ thống ĐỌC, không SINH

**Hiện tại (FR-38):** hệ thống sinh mã căn từ mã dự án + tầng + căn.

**Thực tế:** cả 4 file đều đã có sẵn cột Mã căn, với định dạng riêng của từng chủ đầu tư. Đồng thời công thức của FR-38 **sinh mã trùng ngay trên dữ liệu thật**:

| Tầng + Căn | Trùng giữa | File |
|---|---|---|
| 05 – 01 | `S1.0501` ↔ `S3.0501` | Imperia |
| 05A – 01 | `S1.05A01` ↔ `S2.05A01` | Imperia |
| 05A – 08 | `E1.05A08` ↔ `S2.05A08` | Imperia |
| 21 – 10 | `S1.2110` ↔ `S3.2110` | Imperia |

8/55 dòng trùng nhau (14,5%) vì công thức thiếu thành phần phân biệt tòa.

**Đề nghị sửa FR-38:** hệ thống **đọc mã căn từ file** và kiểm tra tính hợp lệ. Chỉ sinh mã khi file không có cột này.

### 🔴 2.2. Phạm vi duy nhất của mã căn

**Hiện tại (FR-39):** mã căn duy nhất toàn hệ thống.

**Thực tế:** mã trong file không chứa mã dự án (`S1.0501`, `A1-22.07`), nên hai dự án khác nhau chắc chắn trùng.

**Đề nghị:** khóa duy nhất là **mã dự án + mã căn**.

### 🔴 2.3. Quy ước tách mã căn — cần khai báo ở màn Khởi tạo dự án

Mã căn có ít nhất ba dạng, **lẫn lộn ngay trong cùng một file**:

| Dạng | Ví dụ | Cách tách |
|---|---|---|
| Có dấu phân cách | `A1-22.07`, `A4-26-06`, `A3-8A.04` | Tách theo `-` `.` `_` `/` |
| Dính liền, có cột Tầng | `A12207` + cột Tầng = `22` | Dùng cột Tầng làm mốc cắt |
| Dính liền, không có cột Tầng | `A12207` | Cắt theo độ rộng khai báo |

**Đề nghị bổ sung vào màn Khởi tạo dự án:**
- Danh sách **ký hiệu tòa** (`A1`, `A4`, `CT2`) — bắt buộc, vì ký hiệu tòa thường chứa số nên không cắt đúng nếu không biết trước
- **Độ rộng tầng và căn** — mặc định 2+2

### 🔴 2.4. Tầng và Căn số là CHUỖI, không phải số

Dữ liệu thật có `05A`, `08A`, `12A`, `15A` bên cạnh `3`, `28`, `37` — quy ước né số xấu.

Hệ quả:
- Không sort số được, cần khóa sắp xếp riêng (số trước, rồi tầng thường trước tầng có hậu tố)
- **`8` và `8A` là hai tầng khác nhau**, không phải hai cách viết của cùng một tầng — file Cao tầng Op1 có cả hai
- Mã căn **không parse ngược được**: `E1.05A05A` tách được thành `05A|05A` hoặc `05|A05A`. Bắt buộc giữ Tầng và Căn số thành hai cột riêng

### 🔴 2.5. Trục căn không đánh số liên tục

File Cao tầng Op1 có trục: `01 02 03 05A 05 06 08A 08 09 10 11 12 12A 15A 15 16 18A 18 19`

Bỏ 04, 07, 13, 14 và chèn biến thể A. Đáng chú ý: **`05A` đứng TRƯỚC `05`** — ngược với quy tắc sắp xếp tự nhiên.

**Đề nghị:** hệ thống giữ **bộ nhãn gốc theo đúng thứ tự trong file**. Khi gộp hoặc vô hiệu hóa trục, các trục còn lại nhận lần lượt các nhãn trong bộ đó, không đánh số lại từ 01.

### 🟠 2.6. Nhiều cột giá, nhiều chính sách

**Hiện tại:** SRS chỉ có một trường giá.

**Thực tế:** file Imperia có **6 cột giá** chia hai nhóm; file Alumi có 4 cột (`ĐƠN GIÁ`, `TỔNG GIÁ`, `GIÁ HTLS`, `GIÁ TTS`).

Quan hệ số học đã kiểm và nhất quán trong file Imperia:
- Có VAT = chưa VAT × 1,10
- Tổng HĐMB = chưa VAT × 1,12 (phí bảo trì 2% trên giá chưa VAT)

Nhưng **giá theo chính sách không suy được**: căn HTCB chênh đúng 5%, căn bàn giao Thô chênh 5,44–5,46%.

**Đề nghị:**
- Lưu **tất cả cột giá** như dữ liệu, số cột tùy file
- QLGD chọn cột hiển thị mặc định **ngay ở bước nhập file**
- Hai quy tắc số học trên dùng làm **kiểm tra toàn vẹn khi import**

### 🟠 2.7. Tình trạng căn — bổ sung danh mục ánh xạ

**Thực tế:** ô trống là giá trị chủ đạo — 51/55 dòng file Imperia.

| Giá trị trong file | Quy đổi |
|---|---|
| *(trống)* | Còn hàng |
| `LOCK`, `Lock`, `Giữ chỗ`, `Booking` | Đã lock |
| `ĐẶT CỌC`, `Đặt cọc`, `Đã cọc` | Đã cọc |
| `Đã bán`, `Đã ký HĐMB` | Đã bán |

So khớp cần **bỏ dấu và không phân biệt hoa thường**.

### 🟠 2.8. Cột Tình trạng trộn lẫn hai khái niệm

File Alumi có cột Tình trạng chứa `Độc quyền` và `Đã bán` — **"Độc quyền" là quỹ, không phải trạng thái**. Nếu không tách, mọi căn thuộc quỹ độc quyền sẽ mất thông tin còn hàng hay đã bán.

**Đề nghị:** hệ thống nhận diện giá trị thuộc nhóm quỹ, giữ trạng thái Còn hàng và tách nhãn quỹ ra trường riêng.

### 🟠 2.9. Ba cột SRS giả định nhưng file thường không có

**Hướng ban công**, **View**, **Diện tích tim tường**.

File Imperia chỉ có diện tích thông thủy. File Alumi có tim tường nhưng bỏ trống 8/11 dòng.

**Đề nghị:** chuyển ba cột này thành **tùy chọn**, để trống thì QLGD tự điền trên lưới.

### 🟠 2.10. Hai cột file có mà SRS không có

| Cột | Giá trị thực tế |
|---|---|
| **Gói bàn giao** | `HTCB` (49 căn), `Thô` (6 căn) |
| **Số PN / Loại căn** | `1PN+1`, `2PN`, `2PN+1`, `Studio`, `3BR+`, `PENTHOUSE`, `DUPLEX` — là **chuỗi** |

Số PN **không suy được từ diện tích**: 68,27 m² là `2PN+1` còn 68,94 m² là `2PN`.

*Gói bàn giao* nên thành danh mục dùng chung vì nó ảnh hưởng tới giá theo chính sách (mục 2.6).

### 🟡 2.11. Ngày hiệu lực và ghi chú pháp lý

File Imperia có tiêu đề *"QUỸ CHUNG… từ 12/06/2026"* và dòng ghi chú *"diện tích & giá bán là tạm tính… công bố chính thức tại thời điểm ký HĐMB"*.

**Đề nghị:** lưu ngày hiệu lực cùng lần import; **bắt buộc hiển thị dòng ghi chú** kèm bảng hàng trên trang công khai (không cần hiện trong CMS).

### 🟡 2.12. Dữ liệu bẩn cần xử lý

Ghi nhận từ file thật, không cần quyết định của BA nhưng nên đưa vào yêu cầu chất lượng:

- **Dấu thập phân lẫn lộn trong cùng một cột**: `114.93` cạnh `73,35`; `8,598,373,020` cạnh `8.552.845.082`
- **Tiêu đề nhiều tầng**: nhãn nhóm giá nằm ở dòng trên, phủ 3 cột con
- **Khối tiêu đề lặp lại giữa file**
- **Dòng bị ẩn hoặc bị lọc** — Google Sheets API trả về cả dòng ẩn, tức hệ thống thấy dữ liệu mà QLGD không thấy
- **Thứ tự dòng không nhất quán** — importer không được giả định file đã sắp xếp

---

## Phần 3 — Luồng nhập bảng hàng

### 🔴 3.1. Hai dạng bảng hàng, hai luồng xử lý

| | Dạng danh sách | Dạng lưới |
|---|---|---|
| File | Imperia, Alumi | Cao tầng Op1 |
| Cấu trúc | 1 dòng = 1 căn | Giống hệt template hiển thị |
| Có mã căn | ✔ | ✘ — chỉ có trục và tầng |
| Loại căn, hướng, view | theo từng căn | theo trục, đã sẵn dạng dòng tiêu đề |
| Penthouse/duplex | không biểu diễn được | biểu diễn bằng khối và ô gộp |

**Đề nghị:** SRS mô tả cả hai luồng. Dạng lưới đọc thẳng vào mô hình khối; dạng danh sách đi qua bước dựng lưới tự động.

### 🔴 3.2. Hệ thống tự dựng template, QLGD chỉ duyệt

**Hiện tại:** SRS ngụ ý file bảng hàng phải có sheet Tòa (template).

**Vấn đề:** chủ đầu tư gửi dạng list. Bắt QLGD tự tạo template cho từng tòa là **không khả thi với dự án nhiều tòa** — dễ nhầm lẫn, tốn thời gian.

**Đề nghị:** hệ thống **tự sinh template từ danh sách**, QLGD chỉ duyệt và sửa chỗ sai.

Từ danh sách đầy đủ suy được: danh sách trục, danh sách tầng, thuộc tính theo trục (loại căn, diện tích, hướng), và ranh giới khối.

Template thuộc về **tòa nhà**, không thuộc về lần import — làm một lần, dùng cho mọi lần cập nhật quỹ về sau.

### 🟠 3.3. Chỉ số độ phủ

Đo tỷ lệ *số căn / (số tầng × số trục)* để biết nguồn có đủ để dựng lưới không:

| Nguồn | Độ phủ |
|---|---|
| Bảng hàng đầy đủ (Cao tầng Op1) | 100% |
| Imperia — quỹ chung | 10% |
| Alumi — quỹ độc quyền | 2% |

**Đề nghị:** độ phủ dưới 80% thì báo *"đây là quỹ căn, không phải bảng hàng đầy đủ"* và xin nguồn khác — thay vì dựng ra lưới trống 98% khiến QLGD hiểu nhầm là lỗi.

### 🟠 3.4. Khối penthouse và duplex

**Vấn đề:** Loại căn là thuộc tính của **trục** (một dòng tiêu đề cho cả cột), nên không thể vừa là 2PN ở tầng 1–24 vừa là penthouse ở tầng 25–26.

File Cao tầng Op1 giải bằng cách **tách penthouse thành khối riêng** với bộ tiêu đề riêng.

**Đề nghị bổ sung khái niệm KHỐI vào SRS:** một bảng hàng gồm nhiều khối, mỗi khối có bộ dòng tiêu đề riêng và danh sách tầng riêng.

Hệ thống tự phát hiện: trục nào đổi Loại căn giữa chừng thì đó là ranh giới khối.

### 🟠 3.5. Ô gộp trong file mang thông tin penthouse/duplex

**Phát hiện quan trọng:** file `.xlsx` gốc đã mã hóa sẵn:
- Ô gộp **ngang** ở dòng TẦNG/CĂN → duplex thông hai trục
- Ô gộp **dọc** ở vùng tầng → penthouse thông hai tầng

Google Sheets API trả về thông tin này. Hệ thống **tự gộp ô trên lưới**, QLGD không phải làm gì.

Với file không có ô gộp, phát hiện bằng **lỗ hổng dữ liệu**: penthouse thông tầng để lại ô trống ngay dưới; duplex để lại ô trống bên cạnh. Kết hợp với Loại căn ghi `PENTHOUSE`/`DUPLEX` là đủ để **gợi ý**, QLGD xác nhận.

### 🟠 3.6. Trình soạn lưới trong CMS

SRS chưa có khái niệm này. Prototype đã dựng, cần bổ sung yêu cầu:

- Sáu dòng tiêu đề bắt buộc: TẦNG/CĂN, Loại hình, Hướng, DT thông thủy, DT tim tường, View
- Dòng nào file không có thì để trống, QLGD tự điền
- **Gộp và tách ô** ở dòng tiêu đề (VIEW chung nhiều trục)
- **Gộp ô căn hộ** theo cả hai chiều (penthouse, duplex)
- **Gộp trục** — căn duplex chiếm hai trục
- **Vô hiệu hóa trục** — đánh dấu khu vực chung (thang máy, sảnh), hiển thị màu ghi, không đánh số
- Thêm/xóa trục, tầng, khối

### 🟠 3.7. Đồng bộ lại chỉ thay DỮ LIỆU, giữ nguyên TEMPLATE — **đã chốt**

Template (cấu trúc lưới) và dữ liệu căn là **hai lớp tách rời**:

| Lớp | Thuộc về | Tần suất đổi | Khi đồng bộ lại |
|---|---|---|---|
| **Template** — trục, tầng, khối, ô gộp, khu vực chung, dòng tiêu đề | Tòa nhà | Hiếm | **Giữ nguyên** |
| **Dữ liệu căn** — giá, tình trạng, diện tích | Lần đồng bộ | Hằng ngày | Thay mới |

Nhờ vậy công QLGD bỏ ra để soạn lưới chỉ tốn **một lần cho mỗi tòa**, không lặp lại mỗi lần cập nhật quỹ.

**Hệ quả cần xử lý:** căn ở tầng hoặc trục chưa có trên lưới sẽ **không hiển thị được**. Hệ thống phải:

1. Đối chiếu lưới với dữ liệu mới sau mỗi lần đồng bộ
2. Báo rõ: *"12 căn chưa hiển thị được — dữ liệu mới có tầng 25, 26 và trục 05A chưa có trên lưới"*
3. Cho phép **bổ sung vào lưới bằng một thao tác**, giữ nguyên mọi thứ đã soạn

Tuyệt đối không im lặng bỏ qua — căn không hiện là căn không bán được.

### 🟡 3.8. Khu vực chung — đề nghị đưa ra khỏi phạm vi bản đầu

Không có dòng nào trong bảng hàng, không có dấu vết gián tiếp nào để suy. Bảng vẫn dùng tốt khi thiếu; QLGD đánh dấu tay khi cần.

---

## Phần 4 — Nguồn dữ liệu và đồng bộ

### 🔴 4.1. Google Sheets API là bắt buộc

**Ràng buộc thực tế:** bảng hàng chủ đầu tư gửi thường **chặn tải xuống, in, sao chép**.

Đã kiểm chứng trên file thật:

| Đường đọc | Kết quả |
|---|---|
| Drive export (`files.export`) | ❌ Hỏng — *"This file cannot be exported"* |
| Drive download (`alt=media`) | ❌ Không áp dụng với Google Sheet gốc |
| **Google Sheets API** | ✅ Đường duy nhất |

Chặn tải xuống **chỉ giới hạn ở giao diện**, không giới hạn quyền đọc dữ liệu.

**Việc cần làm:** bật Google Sheets API trên project Google Cloud của Cenland. Đây là **cấu hình một lần của đội kỹ thuật**, không liên quan tới chủ đầu tư.

Sheets API còn lấy được hai thứ mà xuất file không có: **ô gộp** (mục 3.5) và **danh sách dòng ẩn** (mục 2.12).

### 🟠 4.2. Quyền truy cập file nguồn

Điều kiện: service account nhìn thấy file. Hai trường hợp:

| Chế độ chia sẻ của CĐT | Cách xử lý | Cần CĐT làm gì |
|---|---|---|
| "Bất kỳ ai có liên kết" | Sheets API đọc thẳng | Không |
| Giới hạn theo email | QLGD dùng `IMPORTRANGE` kéo sang sheet của mình | Không |

**Đã kiểm chứng:** file ALUMI đọc được bằng client ẩn danh, tức đang ở chế độ công khai.

`IMPORTRANGE` chạy bằng quyền xem của chính QLGD — người vốn đã có quyền — nên **không cần xin gì từ chủ đầu tư** trong cả hai trường hợp.

Giới hạn: `IMPORTRANGE` chỉ mang giá trị, **không mang ô gộp**.

### 🟠 4.3. Theo dõi thay đổi từ chủ đầu tư — MÂU THUẪN VỚI FR-06

**FR-06 hiện tại:** không webhook, không đồng bộ định kỳ.

**Nhu cầu thực tế:** QLGD phải liên tục check tình trạng căn với chủ đầu tư và các sàn khác — đây là công việc thủ công tốn nhiều thời gian nhất.

**Đề nghị mở phạm vi**, theo nguyên tắc **phát hiện tự động, áp dụng thủ công**:

| Mức | Cách | Độ trễ |
|---|---|---|
| 1 | Kiểm tra `modifiedTime` của Drive định kỳ | 5–15 phút |
| 2 | Xem khác biệt trước khi áp dụng | — |
| 3 | Nhận thông báo đẩy (`files.watch`) | vài chục giây |

**Tuyệt đối không tự động ghi đè.** Bảng hàng là dữ liệu có tính pháp lý — CĐT đổi giá lúc 2 giờ sáng mà hệ thống tự cập nhật thì sáng ra trang công khai hiện giá mới trong khi QLGD chưa biết.

Đề xuất làm mức 1 và 2, để mức 3 lại cho tới khi có người thực sự cần.

### 🟠 4.4. Ngưỡng an toàn khi đồng bộ lại

Khác biệt vượt **30% số căn** (và tổng trên 20 căn) thì **chặn áp dụng** và cảnh báo.

Lý do: mức đó gần như luôn do chủ đầu tư đổi cấu trúc file khiến ánh xạ cột lệch, chứ hiếm khi là thay đổi kinh doanh thật. Cho phép bỏ qua nhưng phải xác nhận có ý thức.

### 🟠 4.5. Cảnh báo mất quyền truy cập

Ba lần kiểm tra thất bại liên tiếp thì báo *"Mất quyền đọc file nguồn"*. Ngăn loại lỗi tệ nhất: CĐT rút quyền, đồng bộ chết âm thầm, hai tuần sau mới có người nhận ra.

### 🟠 4.6. Hồ sơ định dạng theo chủ đầu tư

Mỗi chủ đầu tư một format riêng, **nhưng ổn định trong cùng một chủ đầu tư**.

**Đề nghị:**
1. Lần đầu: hệ thống đoán cột, QLGD sửa chỗ sai ở màn ánh xạ
2. Lưu ánh xạ gắn với chủ đầu tư
3. Lần sau tự áp, QLGD chỉ xác nhận

Với dự án nhiều tòa cùng chủ đầu tư, đây là chênh lệch giữa làm một lần và làm tám lần.

### 🟡 4.7. Xóa mềm thay vì xóa cứng

**FR-42 hiện tại:** import xóa hẳn các căn không còn trong file mới.

Rủi ro: hệ thống giao dịch cũ có thể đang tham chiếu tới các căn đó. Một lần import sai file sẽ phá dữ liệu hợp đồng.

**Đề nghị:** xóa mềm + kiểm tra tham chiếu trước khi xóa.

### 🟡 4.8. Ba điểm vận hành cần tính

- **Hạn mức API**: giãn chu kỳ kiểm tra theo mức hoạt động — dự án đang bán 15 phút, dự án ngừng bán mỗi ngày
- **Lưu bản sao mỗi lần đồng bộ**: phòng khi CĐT xóa file; vốn đã cần cho chức năng khôi phục
- **Câu hỏi pháp chế**: việc hệ thống tự động đọc file của CĐT liên tục và đưa lên trang công khai — nên hỏi trước

---

## Phần 5 — Danh mục dùng chung cho tính năng bảng hàng

### 5.1. Nguyên tắc: mỗi danh mục cần GIÁ TRỊ CHUẨN kèm DANH SÁCH ĐỒNG NGHĨA

Đây là điểm khác biệt quan trọng nhất so với danh mục thông thường.

Mỗi chủ đầu tư viết một kiểu cho cùng một khái niệm. Danh mục chỉ liệt kê giá trị chuẩn thì importer vẫn không đọc được file thật. Cấu trúc cần có:

```
Tình trạng căn
  ├─ Còn hàng      ← "", "Còn hàng", "Available", "Trống", "Còn"
  ├─ Đã lock       ← "LOCK", "Lock", "Giữ chỗ", "Booking", "Khóa"
  ├─ Đã cọc        ← "ĐẶT CỌC", "Đặt cọc", "Đã cọc", "Deposit"
  └─ Đã bán        ← "Đã bán", "Đã ký HĐMB", "Sold", "Hợp đồng"
```

So khớp **bỏ dấu, không phân biệt hoa thường, bỏ khoảng trắng thừa**.

Danh sách đồng nghĩa phải **bổ sung được từ giao diện** — gặp giá trị lạ thì Admin thêm vào ánh xạ, không phải sửa code.

### 5.2. Bảy danh mục cần có

| # | Danh mục | Trường | Ghi chú |
|---|---|---|---|
| 1 | **Chủ đầu tư** | Tên, mã, hồ sơ định dạng file | Xem mục 4.6 |
| 2 | **Loại hình căn** | Tên chuẩn, đồng nghĩa, **cờ "căn đặc biệt"** | Xem 8.3 |
| 3 | **Tình trạng căn** | Tên chuẩn, đồng nghĩa, màu hiển thị | 4 giá trị chuẩn |
| 4 | **Loại quỹ** | Tên chuẩn, đồng nghĩa, màu | Độc quyền, Chéo, Chung, Thứ cấp |
| 5 | **Gói bàn giao** | Tên chuẩn, đồng nghĩa | HTCB, Thô, Full |
| 6 | **Hướng** | Tên chuẩn, đồng nghĩa | Xem 8.4 |
| 7 | **Loại giá** | Tên chuẩn, nhóm, công thức kiểm tra | Xem 8.5 |

### 5.3. Loại hình căn — cần cờ "căn đặc biệt"

Giá trị thực tế thu được: `Studio`, `1PN`, `1PN+1`, `1BR+`, `2PN`, `2BR+`, `2BR + 1MR`, `3PN`, `3BR+`, `DUPLEX`, `PENHOUSE`, `PENTHOUSE`, `ST`.

Lưu ý ba điểm:

- **`PN` và `BR` là cùng một khái niệm**, viết theo tiếng Việt và tiếng Anh
- Chính file gốc có **lỗi chính tả** `PENHOUSE` — danh sách đồng nghĩa phải chứa cả bản sai
- **Cờ "căn đặc biệt"** đánh dấu `DUPLEX` và `PENTHOUSE`. Hệ thống dùng cờ này để tự phát hiện ranh giới khối và gợi ý gộp ô (mục 3.4, 3.5)

### 5.4. Hướng — viết tắt rất khác nhau

Thu được: `Đông`, `Bắc`, `Nam`, `Tây`, `TB`, `ĐB`, `ĐN`, `TN`, `TB - ĐB`, `ĐB - ĐN`, `DB_DN`, `TN_TB`, `DN`, `TB`.

Ba dạng cần xử lý:

| Dạng | Ví dụ | Quy đổi |
|---|---|---|
| Đầy đủ | `Đông Bắc` | ĐB |
| Viết tắt | `ĐB`, `DB` | ĐB |
| Khoảng hai hướng | `TB - ĐB`, `DB_DN` | Giữ nguyên cả hai |

Dấu ngăn có thể là `-`, `_`, `/` hoặc khoảng trắng.

### 5.5. Loại giá — cần công thức kiểm tra

Số cột giá tùy file (đã gặp 1, 4 và 6 cột). Danh mục nên định nghĩa các loại giá chuẩn kèm quan hệ số học để **kiểm tra toàn vẹn khi import**:

| Loại giá chuẩn | Nhóm | Quan hệ |
|---|---|---|
| TGT chưa VAT | Giá tiêu chuẩn | gốc |
| TGT có VAT, chưa PBT | Giá tiêu chuẩn | = chưa VAT × 1,10 |
| Tổng giá trị HĐMB | Giá tiêu chuẩn | = chưa VAT × 1,12 |
| Đơn giá | — | = tổng ÷ diện tích |
| Giá theo chính sách | Nhóm riêng | **không suy được**, phải lưu |

Hai công thức nhân đã kiểm chứng đúng trên toàn bộ 55 dòng file Imperia. Lệch quá sai số làm tròn thì cảnh báo — nhiều khả năng ánh xạ cột lệch.

### 5.6. Danh mục thuộc DỰ ÁN, không phải hệ thống

Ba thứ sau tùy từng dự án, không đưa vào danh mục dùng chung:

| Cấu hình | Thuộc | Dùng để |
|---|---|---|
| **Ký hiệu tòa** (`A1`, `A2`, `CT2`) | Dự án | Tách mã căn |
| **Độ rộng tầng và căn** | Dự án | Tách mã căn dính liền |
| **Ánh xạ ký hiệu tòa → dự án bán hàng** | Dự án | Phân căn về đúng tòa khi file có nhiều tòa |
| **Thang tầng, thang trục** | Tòa | Đọc từ file, sửa trên lưới |

### 5.7. Hồ sơ định dạng theo chủ đầu tư

Gắn với danh mục Chủ đầu tư (mục 4.6). Lưu:

- Ánh xạ cột: tên cột trong file → trường trong hệ thống
- Dòng tiêu đề nằm ở dòng thứ mấy
- Quy ước phân tách mã căn
- Danh sách sheet cần bỏ qua

Lần đầu nhập file của một chủ đầu tư thì QLGD sửa phần đoán sai; lần sau tự áp.

---

## Phần 6 — Định danh dự án và mã căn

### 🔴 6.1. Mã dự án không được lấy từ ký hiệu của chủ đầu tư

**Hiện tại (FR-05):** người dùng nhập mã dự án, hệ thống bắt duy nhất toàn hệ thống.

**Vấn đề thực tế:** hai chủ đầu tư khác nhau hoàn toàn có thể cùng dùng `A1` làm tiền tố mã căn — tòa Alumi và tòa Arena thuộc hai dự án khác nhau. QLGD có xu hướng gõ luôn ký hiệu đó làm mã dự án, và hệ thống chặn dù chẳng có gì sai.

**Gốc vấn đề:** SRS đang trộn **ba loại mã khác nhau** vào một khái niệm.

| Loại mã | Ví dụ | Ai đặt | Phạm vi duy nhất |
|---|---|---|---|
| **Mã dự án** | `ALR-HL` | Hệ thống sinh | Toàn hệ thống |
| **Ký hiệu tòa** | `A1` | Chủ đầu tư | **Không ràng buộc** |
| **Mã căn** | `A1-22.07` | Chủ đầu tư | Trong một dự án bán hàng |

### 🔴 6.2. Ba ràng buộc duy nhất

```
unique (mã dự án)                 -- hệ thống sinh, không lấy từ CĐT
unique (dự án bán hàng, mã căn)   -- khóa thật của căn hộ
ký hiệu tòa                       -- KHÔNG ràng buộc, chỉ là cấu hình đọc file
```

**Đề nghị sửa FR-05:** hệ thống sinh mã dự án tự động từ cây dự án:

```
Dự án cha:      ALR       (An Lạc Riverside)
Dự án bán hàng: ALR-01, ALR-02, ALR-03
```

Trùng thì tự thêm hậu tố. QLGD sửa được trước khi xuất bản, khóa sau khi xuất bản như FR-05 hiện quy định.

**Đề nghị sửa FR-39:** mã căn duy nhất trong phạm vi **dự án bán hàng**, không phải toàn hệ thống.

### 🟠 6.3. Ký hiệu tòa là cấu hình đọc file

Không phải một trường của dự án. Đặt trong cấu hình bảng hàng:

```
Cấu hình bảng hàng — dự án ALR
  ├─ Ký hiệu tòa   : A1, A2, A3
  ├─ Độ rộng tầng  : 2
  ├─ Độ rộng căn   : 2
  └─ Ánh xạ tòa → dự án bán hàng
       A1 → ALR-01
       A2 → ALR-02
```

Bảng ánh xạ cuối là thứ giải bài toán trùng ký hiệu: cùng `A1` nhưng ở hai dự án khác nhau thì trỏ tới hai dự án bán hàng khác nhau. Nó cũng xử lý luôn tình huống **một file chứa nhiều tòa** — một lần nhập sinh ra nhiều dự án bán hàng.

### 🟠 6.4. URL công khai

URL cần duy nhất toàn hệ thống nhưng **không nên lấy mã dự án** — mã sinh tự động thì vô nghĩa với người mua.

**Đề nghị:** slug sinh từ tên, trùng thì thêm hậu tố — `alumi-toa-a1`, `arena-toa-a1`. Sinh một lần, cho sửa tay, không tự đổi khi đổi tên dự án.


---

## Phần 7 — Các mục tồn đọng từ đợt rà soát trước

Chưa có phản hồi, nhắc lại ngắn gọn.

| # | Nội dung | Mức |
|---|---|---|
| 7.1 | Mục 1.4 định nghĩa dự án cao tầng là *một tòa*, phụ lục 7.3 lại cho mỗi tòa một sheet, Bước 1 cho chấm nhiều pin — ba chỗ mâu thuẫn | 🔴 |
| 7.2 | Dự án con xuất bản khi dự án cha còn Nháp → trang công khai không có lối vào | 🟠 |
| 7.3 | Thời điểm dự án bán hàng biến thành dự án cha — dữ liệu bảng hàng cũ đi đâu | 🟠 |
| 7.4 | Ảnh hero banner: UC-11 chặn gửi duyệt nhưng 7.1 và 7.2 không có trường/thư mục nào. **Mã nguồn đã có** thư mục `01. Tổng quan / Ảnh hero banner` — đề nghị lấy làm chuẩn | 🟡 |
| 7.5 | Bước 30 mục 3.5 ghi *"không thể khôi phục tự động"* trong khi UC-10 cho khôi phục | 🟡 |
| 7.6 | Địa giới hành chính ba cấp đã lỗi thời — từ 01/07/2025 còn hai cấp | 🟡 |
| 7.7 | Cây thư mục Drive trong mã nguồn chi tiết hơn phụ lục 7.2 — đề nghị lấy mã nguồn làm chuẩn | 🔴 |
| 7.8 | FR-19 quy định nhận diện thư mục theo folder ID, mã nguồn đang so theo tên | 🔴 |
| 7.9 | Đồng bộ nội dung văn bản đã cắt khỏi SRS v2.0 nhưng **mã nguồn đã làm xong và chạy** — cân nhắc lấy lại | 🟠 |

---

## Phần 8 — Dữ liệu cần được giao

| # | Hạng mục | Ghi chú |
|---|---|---|
| 8.1 | **Bảng hàng đầy đủ của một dự án nhiều tòa** | Quan trọng nhất — để kiểm chứng luồng tự dựng lưới |
| 8.2 | Danh sách ký hiệu tòa của vài dự án mẫu | Cho mục 2.3 |
| 8.3 | Bảng ánh xạ chức danh HRM → nhóm quyền | Cần trước khi test phân quyền |
| 8.4 | Danh mục ban đầu: Loại đơn vị, Danh mục dự án, Chủ đầu tư, Gói bàn giao | |
| 8.5 | Kế hoạch gán Loại hình + Danh mục cho 200+ dự án cũ | OI-07 |
| 8.6 | **Giá trị thực tế của 7 danh mục ở Phần 5**, kèm các cách viết đã gặp | Càng nhiều biến thể càng tốt |

---

## Phần 9 — Đề nghị cách xử lý

| Việc | Thành phần | Thời lượng |
|---|---|---|
| **Phiên 1** — Phần 2, ưu tiên 2.1 đến 2.5 | BA + QLGD | 90 phút |
| **Phiên 2** — Phần 3 (luồng nhập và trình soạn lưới) | BA + QLGD + PO | 60 phút |
| **Phiên 3** — Mục 4.3 (mở phạm vi FR-06) + 4.8 + Phần 6 (định danh) | BA + PO + pháp chế | 45 phút |
| **Phiên 4** — Phần 5 (danh mục dùng chung) | BA + QLGD + Admin | 60 phút |
| **Văn bản** — Phần 7 | BA trả lời, không cần họp | — |
| **Giao dữ liệu** — Phần 8 | Có người nhận việc và hạn chót | — |

**Nên làm trước tiên:** bật Google Sheets API (mục 4.1) — đây là việc kỹ thuật, không cần chờ BA, và nó đang chặn toàn bộ luồng nhập bảng hàng.
