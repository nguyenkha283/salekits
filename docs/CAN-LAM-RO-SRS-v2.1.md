# Các điểm cần làm rõ — SRS v2.0

**Gửi:** BA · **Từ:** Nhóm phát triển · **Ngày:** 01/08/2026
**Bối cảnh:** tổng hợp sau khi rà soát SRS v2.0, ba bản dựng prototype, và **file bảng hàng thật** `Quỹ chung Imperia Sky Park` nhận ngày 01/08.

Ưu tiên: 🔴 chặn thiết kế · 🟠 cần chốt trước khi lập trình · 🟡 làm rõ khi thuận tiện

---

## Phần A — Phát hiện từ file bảng hàng thật

File thật bác bỏ một số giả định trong SRS. Đây là phần cần xử lý trước.

### 🔴 A-01. Sheet phân theo QUỸ hay theo TÒA?

SRS mục 3.5 và phụ lục 7.3 giả định **mỗi tòa một sheet**, sheet quỹ chỉ chứa danh sách mã căn (7.5). File thật ngược lại:

- Một sheet tên *"QUỸ CHUNG IMPERIA SKY PARK"* chứa **cả 4 tòa** (E1, S1, S2, S3)
- Tòa là một **cột dữ liệu** (`TRỤC / Tòa`), không phải tên sheet
- Sheet quỹ mang **dữ liệu đầy đủ**, không phải danh sách mã căn trần

**Câu hỏi:** file bảng hàng đầy đủ có cấu trúc sheet như thế nào? Phải chăng là `Quỹ chung` / `Quỹ độc quyền` / `Quỹ chéo`, mỗi sheet một danh sách đầy đủ?

**Ảnh hưởng:** quyết định popup chọn sheet hỏi câu gì. Hiện prototype hỏi "sheet này là Tòa nhà hay Quỹ căn" — nếu A-01 đúng thì phải hỏi "sheet này thuộc quỹ nào".

**Đề nghị:** gửi kèm **một file bảng hàng đầy đủ nhiều sheet** để đối chiếu.

### 🔴 A-02. Mã căn: hệ thống SINH hay ĐỌC từ file?

FR-38 quy định hệ thống sinh mã căn từ mã dự án + tầng + căn. Nhưng file thật **đã có sẵn cột `Mã căn hộ`** với định dạng `[Tòa].[Tầng][Căn]` — ví dụ `E1.0305`, `S2.15A08A`.

Đồng thời, công thức của FR-38 sinh **mã trùng ngay trên 55 dòng đầu**:

| Tầng + Căn | Trùng giữa |
|---|---|
| 05 – 01 | `S1.0501` ↔ `S3.0501` |
| 05A – 01 | `S1.05A01` ↔ `S2.05A01` |
| 05A – 08 | `E1.05A08` ↔ `S2.05A08` |
| 21 – 10 | `S1.2110` ↔ `S3.2110` |

**8/55 dòng trùng nhau (14,5%)** vì công thức thiếu thành phần phân biệt tòa.

**Đề xuất:** đổi FR-38 từ *sinh mã* sang **đọc mã từ file và kiểm tra tính hợp lệ**. Việc này làm hệ thống nhẹ đi, đồng thời tôn trọng mã mà đội kinh doanh đang dùng thật.

### 🔴 A-03. Phạm vi duy nhất của mã căn

Mã trong file (`S1.0501`) **không chứa mã dự án**, nên hai dự án khác nhau chắc chắn trùng mã. FR-39 yêu cầu duy nhất toàn hệ thống là không thực thi được.

**Đề xuất:** khóa duy nhất là **mã dự án + mã căn hộ**.

### 🔴 A-04. Tầng và Căn số là CHUỖI, không phải số

File có `05A`, `08A`, `12A`, `15A` bên cạnh `3`, `28`, `37` — quy ước tránh số xấu.

Hệ quả:
- Lưới bảng hàng không sort số được, cần **bảng thứ tự tầng** khai riêng
- Mã căn **không parse ngược được**: `E1.05A05A` tách được thành `05A|05A` hoặc `05|A05A`. Bắt buộc giữ Tầng và Căn số thành hai cột riêng.

**Câu hỏi:** danh sách tầng chuẩn của dự án lấy ở đâu? Khai tay hay suy từ dữ liệu?

### 🔴 A-05. Sáu cột giá, hai chính sách song song

| Nhóm | Ba cột |
|---|---|
| Giá tiêu chuẩn | chưa VAT · có VAT chưa PBT · tổng HĐMB |
| Chính sách ổn định lãi suất | chưa VAT · có VAT chưa PBT · tổng HĐMB |

SRS chỉ có **một** trường giá.

Quan hệ số học đã kiểm và nhất quán:
- Có VAT = chưa VAT **× 1,10**
- Tổng HĐMB = chưa VAT **× 1,12** (phí bảo trì 2% trên giá chưa VAT)

Nhưng **giá chính sách không suy được**: căn HTCB chênh đúng 5%, còn 6 căn bàn giao *Thô* chênh **5,44–5,46%**. Nên phải lưu cả 6 cột như dữ liệu.

**Câu hỏi:**
1. Trang công khai hiển thị cột giá nào là mặc định?
2. Người mua có được tự chọn xem theo chính sách không, hay chỉ người quản lý cấu hình?
3. Số cột giá cố định 6, hay tùy dự án?

**Đã làm trong prototype:** thêm bộ chọn loại giá cho người quản lý, mặc định *Tổng giá trị HĐMB*.

### 🟠 A-06. Tình trạng để trống là giá trị chủ đạo

51/55 dòng **bỏ trống**, 2 dòng `LOCK`, 2 dòng `ĐẶT CỌC`. Không dòng nào ghi "Còn hàng" hay "Đã bán".

**Đề xuất bổ sung vào danh mục ánh xạ (FR-41):**

| Giá trị trong file | Quy đổi |
|---|---|
| *(trống)* | Còn hàng |
| `LOCK`, `Lock`, `Đã lock`, `Giữ chỗ` | Đã lock |
| `ĐẶT CỌC`, `Đặt cọc`, `Đã cọc` | Đã cọc |
| `Đã bán`, `Đã ký HĐMB` | Đã bán |

So khớp cần **bỏ dấu và không phân biệt hoa thường**.

**Câu hỏi:** căn *Đã bán* nằm ở sheet nào? File này không có dòng nào.

### 🟠 A-07. Tiêu đề nhiều tầng và lặp giữa file

- Nhãn *"GIÁ RIÊNG NẾU CHỌN CHÍNH SÁCH ỔN ĐỊNH LÃI SUẤT"* nằm ở dòng trên, phủ 3 cột con → header **hai tầng**, không phải một dòng như giả định ở Q22
- Khối tiêu đề **lặp lại giữa file** (trước dòng 40)

**Câu hỏi:** khối lặp đó là dòng thật trong sheet hay chỉ là print-repeat khi xuất PDF? Nếu là dòng thật, importer phải nhận diện và bỏ qua.

### 🟠 A-08. Ba cột SRS giả định nhưng file không có

**Hướng ban công**, **View**, **Diện tích tim tường** — file chỉ có *diện tích thông thủy*.

Bản design đang hiển thị "DT tim tường" bằng chính giá trị thông thủy, tức đang hiện số sai. Hai dòng tiêu đề "Hướng ban công" và "View" trong lưới sẽ trống.

**Câu hỏi:** ba cột này bắt buộc hay tùy chọn? Nếu bắt buộc thì lấy từ nguồn nào?

### 🟠 A-09. Hai cột file có mà SRS không có

| Cột | Giá trị thực tế |
|---|---|
| **Gói bàn giao** | `HTCB` (49 căn), `Thô` (6 căn) |
| **Số PN** | `1PN+1`, `2PN`, `2PN+1` — là **chuỗi**, không phải số |

Số PN **không suy được từ diện tích**: 68,27 m² là `2PN+1` còn 68,94 m² là `2PN`.

**Đề nghị:** bổ sung cả hai vào phụ lục 7.3. *Gói bàn giao* nên thành danh mục dùng chung vì nó ảnh hưởng tới giá chính sách (A-05).

### 🟡 A-10. Ngày hiệu lực và ghi chú pháp lý

- Tiêu đề ghi *"từ 12/06/2026"* — SRS chưa có khái niệm **ngày hiệu lực** của bảng hàng
- Dòng ghi chú *"diện tích & giá bán là tạm tính… công bố chính thức tại thời điểm ký HĐMB"*

**Đề nghị:** lưu ngày hiệu lực cùng lần import, và **bắt buộc hiển thị dòng ghi chú** kèm bảng hàng công khai. Đây là nội dung có tính pháp lý.

### 🟡 A-11. Thứ tự dòng không nhất quán

Hai căn `ĐẶT CỌC` bị đẩy xuống cuối file, phá thứ tự nhóm theo tòa. Importer không được giả định file đã sắp xếp.

---

## Phần B — Mâu thuẫn trong SRS v2.0 (đã gửi trước, chưa có phản hồi)

### 🔴 B-01 (M-01). Mã căn cao tầng khi dự án có nhiều tòa
Mục 1.4 định nghĩa dự án bán hàng cao tầng là **một tòa**; phụ lục 7.3 lại cho **mỗi tòa một sheet**; Bước 1 cho chấm **nhiều pin** tên tòa. Ba chỗ mâu thuẫn. Xem thêm A-01 và A-02.

### 🔴 B-02 (M-02). FR-39 không thực thi được với dự án thấp tầng
Mã căn thấp tầng nhập tay trong file, hai dự án dùng chung `LK-01` là bình thường. Xem A-03.

### 🟠 B-03 (M-03). Dự án con xuất bản khi dự án cha còn Nháp
Trang chủ chỉ hiển thị dự án cha, nên dự án con thành trang công khai **không có lối vào**.
*Đề xuất:* chặn duyệt con khi cha chưa duyệt.

### 🟠 B-04 (M-04). Thời điểm dự án bán hàng biến thành dự án cha
FR-02 nói hệ thống tự xác định. Khi tạo dự án con đầu tiên: loại hình chuyển từ khai tay sang suy ra, trạng thái kinh doanh bị khóa, bảng hàng chuyển sang tổng hợp chỉ đọc — **dữ liệu cũ đi đâu?**
*Đề xuất:* chặn tạo dự án con nếu dự án đã có bảng hàng.

### 🟠 B-05 (M-05). Quan hệ tòa ↔ căn chưa có chỗ lưu
FR-31 và mục 5.4 cần lọc bảng hàng theo tòa, nhưng cột bắt buộc ở 7.3 không có trường tòa. *(File thật CÓ cột này — xem A-01, nên có thể coi như đã giải quyết nếu A-01 được chốt.)*

### 🟡 B-06 (M-06). Ảnh hero banner chưa có đường nạp
UC-11 chặn gửi duyệt nếu chưa có ảnh hero, nhưng 7.1 và 7.2 không có trường hay thư mục nào cho ảnh này.
*Ghi chú:* mã nguồn CMS **đã có thư mục** `01. Tổng quan / Ảnh hero banner`. Đề nghị lấy quy ước của code làm chuẩn và cập nhật SRS.

### 🟡 B-07 (M-07). Hộp thoại xác nhận import mâu thuẫn với UC-10
Bước 30 mục 3.5 ghi *"không thể khôi phục tự động"* trong khi UC-10 cho khôi phục.

### 🟡 B-08 (M-08). Xóa cứng căn trong CSDL dùng chung
FR-42 xóa hẳn căn không còn trong file mới. Hệ thống giao dịch cũ có thể đang tham chiếu.
*Đề xuất:* xóa mềm + kiểm tra tham chiếu.

### 🟡 B-09 (M-09). Địa giới hành chính ba cấp đã lỗi thời
FR-08 và 7.1 quy định Tỉnh → Quận/Huyện → Phường/Xã. Từ 01/07/2025 mô hình còn **hai cấp**.
*Đề xuất:* Tỉnh → Phường/Xã, giữ thêm một trường tự do cho địa danh cũ.

---

## Phần C — Cây thư mục Drive

### 🔴 C-01. Cây thư mục trong mã nguồn khác phụ lục 7.2

```
Mã nguồn:  Tổng quan/{Ảnh hero banner, Nội dung tổng quan.*, Ảnh tổng quan,
                      Vị trí/, Ảnh mặt bằng/, Ảnh tiện ích/}
           Mặt bằng/ · Bảng hàng/ · Ảnh 360/ · Banner dọc/
           Tài liệu/{Đào tạo, Chính sách bán hàng, Tiến độ, Tài liệu}

SRS 7.2:   01. Tổng quan · 02. Đào tạo · 03. Mặt bằng · 04. Ảnh 360
           05. Chính sách bán hàng · 06. Tiến độ · 07. Tài liệu
```

**Đề nghị:** lấy cây trong mã nguồn làm chuẩn vì nó chi tiết hơn, rồi cập nhật SRS.

### 🔴 C-02. Nhận diện thư mục theo TÊN, trái với FR-19
Mã nguồn so khớp theo tên thư mục. FR-19 quy định nhận diện theo **folder ID**. Hiện đổi tên thư mục trên Drive là đồng bộ gãy ngay.

### 🟠 C-03. Đồng bộ văn bản đã làm xong nhưng SRS đã cắt
SRS v2.0 loại bỏ tính năng đồng bộ nội dung văn bản với lý do chi phí bộ chuyển đổi cao. **Chi phí đó đã bỏ ra rồi và nó chạy** — Google Doc và .docx qua `mammoth`, .txt qua heuristic.

**Đề nghị:** cân nhắc lấy lại vào phạm vi. Hạn chế hiện tại: bộ lọc HTML chưa cho phép thẻ tiêu đề, liên kết và bảng — cần mở rộng nếu khôi phục.

### 🟡 C-04. Tab Tiến độ chưa chia theo đợt
FR-24 yêu cầu mỗi thư mục con là một đợt. Mã nguồn đang đọc phẳng.

---

## Phần D — Dữ liệu cần được giao

Không cần thảo luận, chỉ cần người nhận việc và hạn chót.

| # | Hạng mục | Ghi chú |
|---|---|---|
| D-1 | **File bảng hàng đầy đủ nhiều sheet** | Quan trọng nhất — quyết định A-01 |
| D-2 | Bảng ánh xạ chức danh HRM → nhóm quyền | Cần trước khi test phân quyền |
| D-3 | File Excel mẫu bảng hàng cho cả hai loại hình | Làm chuẩn phát cho các đội |
| D-4 | Danh mục ban đầu | Loại đơn vị (kèm đánh dấu cấp cha/con), Danh mục dự án, Chủ đầu tư, Gói bàn giao |
| D-5 | Danh sách tầng chuẩn | Xem A-04 |
| D-6 | Kế hoạch gán Loại hình + Danh mục cho 200+ dự án cũ | OI-07 |

---

## Phần E — Cần người ngoài BA

Cần bên nắm cơ sở dữ liệu hiện hữu tham gia.

| # | Nội dung |
|---|---|
| E-1 | "Dùng chung CSDL với hệ thống hiện hữu" nghĩa là gì: bảng nào chung, ai ghi vào đâu, ai sở hữu lược đồ |
| E-2 | Dự án cũ và mới có cùng bảng không (FR-50 hàm ý là có) |
| E-3 | Phân hệ giao dịch có tham chiếu tới bảng căn không (liên quan B-08) |
| E-4 | Đo hiệu năng hiện trạng trước khi chốt NFR-02 (2.000 người đồng thời, dưới 5 giây) |
| E-5 | Truy vấn kiểm tra mã căn trùng trong dữ liệu cũ |
| E-6 | Phương án lưu trữ và phân phối ảnh sau đồng bộ (OI-02) |

---

## Đề nghị cách xử lý

| Việc | Thành phần | Thời lượng |
|---|---|---|
| **Phiên 1** — Phần A, ưu tiên A-01 đến A-05 | BA + Quản lý giao dịch | 60 phút |
| **Phiên 2** — Phần E | BA + người nắm CSDL cũ | 90 phút |
| **Văn bản** — Phần B và C | BA trả lời, không cần họp | — |
| **Giao dữ liệu** — Phần D | Có người nhận việc và hạn chót | — |

**Nên làm trước tiên:** gửi file bảng hàng đầy đủ (D-1). Nó quyết định phần lớn Phần A, và Phần A đang chặn thiết kế module import — hạng mục nặng nhất còn lại.
