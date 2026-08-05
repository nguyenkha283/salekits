# Phiếu rà soát SRS v3.0 — phần Bảng hàng

**Gửi:** BA · **Từ:** Nhóm phát triển · **Ngày:** 05/08/2026
**Phạm vi rà soát:** mục 2.3, 2.4, 3.5, 3.6, 3.7, UC-10 đến UC-14, FR-40 đến FR-74, phụ lục 7.4 đến 7.6

**Đánh giá chung:** 9/10 trên thang *đủ để thiết kế chi tiết*. Đây là lần đầu tài liệu đi trước prototype thay vì chạy theo. Mục 2.4 tách ba loại mã, FR-46 đổi từ sinh mã sang đọc mã, và mục 3.6 tách template khỏi dữ liệu đều là những quyết định đúng và được lập luận rõ.

Phiếu này ghi các điểm cần chốt. Cột **Quyết định** để BA điền.

---

## A. Cần chốt trong buổi họp — 45 phút

### 🔴 A-01. Kiểu 1 (đọc sheet Tòa) biến mất khỏi tài liệu

**Hiện trạng:** quét toàn văn cho kết quả 0 lần xuất hiện *"sheet tòa"*, *"bảng biểu"*, *"Kiểu 1"*, *"Kiểu 2"*.

- Bước 23 phân loại sheet chỉ có ba lựa chọn: dữ liệu căn, khai báo quỹ, bỏ qua
- Mục 3.6 mô tả duy nhất đường dựng lưới từ danh sách phẳng
- RR-06 ghi *"File dạng lưới không có cột Mã căn sẽ bị từ chối nhập"*

**Vấn đề:** phía nghiệp vụ đã chốt **hai kiểu nhập** trong buổi làm việc trước. Nhóm phát triển đã cài xong bộ đọc sheet Tòa và kiểm chứng trên file thật `Cao tầng Op1 — TÒA TEST1 (T1)`: đọc đúng 3 khối, ô gộp VIEW phủ 5/11/3 trục, duplex thông trục ở tầng 25, penthouse thông tầng 26–27.

**Thiệt hại nếu bỏ Kiểu 1:**

| Thông tin | Đọc sheet Tòa | Dựng từ danh sách |
|---|---|---|
| Khối penthouse, duplex | Có sẵn trong file | Phải suy, chỉ gợi ý |
| Ô gộp VIEW nhiều trục | Có sẵn | Không suy được |
| **Khu vực chung** | Có sẵn — ô trống giữa dải trục | **Không suy được** |
| Thứ tự trục `05A` trước `05` | Đúng nguyên bản | Phải đoán |

Lưu ý dòng thứ ba: mục 1.3 đưa *"Đánh dấu khu vực chung trên lưới"* ra ngoài phạm vi với lý do *"không có dữ liệu nào trong file để suy ra"*. Lý do này **chỉ đúng với dạng danh sách**.

**Đề nghị:**
1. Bổ sung *sheet tòa* thành loại thứ tư ở bước 23
2. Thêm mục 3.6.1 mô tả đường đọc trực tiếp từ sheet Tòa
3. Sửa RR-06: chỉ từ chối khi file **chỉ có** lưới mà không có sheet dữ liệu căn
4. Cân nhắc đưa khu vực chung trở lại phạm vi, giới hạn ở Kiểu 1

**Quyết định:** ☐ Giữ cả hai kiểu ☐ Chỉ Kiểu 2 ☐ Khác: ______

---

### 🔴 A-02. Giá và Tình trạng đang là cột tùy chọn

**Hiện trạng:** FR-44 chỉ bắt buộc bốn cột (Tòa, Tầng, Căn, Mã căn). Phụ lục 7.4 xếp *Tình trạng* và *Các cột giá* vào nhóm tùy chọn.

**Vấn đề:** bảng hàng không có giá và không có tình trạng thì tab Bảng hàng và tab Quỹ căn không hiển thị được gì có ý nghĩa. Phía nghiệp vụ đã chốt trước đó: bắt buộc gồm **Tòa, Tầng, Căn, Mã căn, Giá, Tình trạng**.

**Đề nghị:** nâng Giá và Tình trạng lên nhóm bắt buộc, sửa FR-44 thành sáu cột.

**Quyết định:** ☐ Đồng ý ☐ Giữ nguyên, lý do: ______

---

### 🔴 A-03. Ngưỡng độ phủ chỉ cảnh báo, không chặn

**Hiện trạng:** bước 28 và FR-53 — dưới 80% thì báo đây là quỹ căn và *"đề nghị QLGD xác nhận trước khi tiếp tục"*.

**Vấn đề:** đo trên file thật cho ba mức rất khác nhau:

| Nguồn | Độ phủ |
|---|---|
| Bảng hàng đầy đủ (Cao tầng Op1) | 100% |
| Imperia — quỹ chung | 10% |
| Alumi — quỹ độc quyền | **2%** |

Với độ phủ 2%, lưới sinh ra trống 98% và hoàn toàn vô dụng. Cho đi tiếp chỉ tạo ra một bảng hàng hỏng mà QLGD tưởng là đúng.

**Đề nghị chia hai ngưỡng:**
- Dưới 80%: cảnh báo, cho tiếp tục sau xác nhận
- Dưới 30%: **chặn**, yêu cầu nguồn khác

**Quyết định:** ☐ Đồng ý ☐ Ngưỡng khác: ______

---

### 🟠 A-04. Chưa có cơ chế giảm công cho dự án nhiều tòa

**Hiện trạng:** FR-68 nói template thuộc về tòa nhà. Dự án tám tòa nghĩa là tám lần duyệt lưới.

**Đề nghị:** bổ sung yêu cầu **phát hiện tòa trùng bố cục và áp hàng loạt** — nếu nhiều tòa có cùng danh sách trục và cùng thuộc tính theo trục thì gộp thành một lần duyệt. File `Cao tầng Op1` có S1, S2, S3 và N1, N2, N3, rất có thể đúng trường hợp này.

**Quyết định:** ☐ Bổ sung ☐ Để phase sau

---

## B. Bổ sung bằng văn bản — không cần họp

### 🟠 B-01. Cột Quỹ chưa có trong phụ lục 7.4

FR-52 quy định quỹ đọc từ cột Quỹ, nhưng phụ lục 7.4 không liệt kê cột này ở cả hai nhóm. Phía nghiệp vụ đã chốt *"thêm cột Quỹ trong sheet quỹ căn"*.

**Đề nghị:** bổ sung vào nhóm cột tùy chọn, ghi rõ khi thiếu thì dùng sheet khai báo quỹ theo 7.5.

### 🟠 B-02. Thiếu FR về thứ tự hiển thị quỹ

Đã chốt: thứ tự cố định **Độc quyền → chung và chéo → quỹ khác**; chỉ quỹ độc quyền mang biểu tượng vương miện; không dùng màu sắc để phân biệt quỹ.

**Đề nghị:** thêm một FR vào nhóm 5.7.

### 🟠 B-03. Thiếu FR về bộ lọc tab Quỹ căn

Đã chốt: bảy tiêu chí (Giá, Loại hình, Diện tích, Tầng, Trục căn, Tòa nhà, Tình trạng), đặt ở hai nơi — dải nút trên bảng và nút cạnh mỗi tên cột. Nhiều giá trị trong một cột lấy hợp, nhiều cột lấy giao. Khoảng giá 11 mức, khoảng diện tích 7 mức.

Cột hiển thị: Mã căn, Giá niêm yết, Loại hình, Hướng, View, DT tim tường, DT thông thủy, Tầng, Trục căn, Tòa nhà, Tình trạng. Loại giá đang hiển thị ghi ngay trên bảng.

**Đề nghị:** thêm một nhóm FR.

### 🟠 B-04. Thiếu FR về IMPORTRANGE

Mục 3.7 nêu `IMPORTRANGE` là đường xử lý khi chủ đầu tư giới hạn chia sẻ theo email, nhưng không có FR nào. Không có FR thì hạng mục này sẽ bị bỏ quên khi ước lượng.

**Đề nghị:** thêm FR, kèm ghi chú hạn chế *"IMPORTRANGE chỉ mang giá trị, không mang thông tin ô gộp"*.

### 🟠 B-05. Thiếu FR về hạn mức Google API

Mục 3.7 nói giãn chu kỳ kiểm tra theo mức hoạt động nhưng không có FR. Với vài trăm dự án nhân với chu kỳ ngắn, đây là chi phí vận hành thật.

**Đề nghị:** thêm FR quy định chu kỳ theo trạng thái kinh doanh — đang bán kiểm tra dày, ngừng bán kiểm tra thưa.

### 🟡 B-06. Diện tích thông thủy nên là cột bắt buộc

Phụ lục 7.4 xếp vào nhóm tùy chọn, nhưng đơn giá và mọi phép kiểm tra toàn vẹn giá đều dựa vào nó.

**Đề nghị:** nâng lên bắt buộc, hoặc ghi rõ hệ quả khi thiếu (không tính được đơn giá, không kiểm tra được toàn vẹn giá).

### 🟡 B-07. Câu chữ hộp thoại xác nhận nhập

Bước 30 vẫn mở đầu bằng *"không thể khôi phục tự động"* rồi mới giải thích có khôi phục thủ công. Không còn mâu thuẫn nhưng vẫn gây lo cho người dùng.

**Đề nghị sửa thành:** *"Hành động này ghi đè toàn bộ dữ liệu căn hiện có. File gốc được lưu lại, khôi phục thủ công qua màn hình lịch sử nhập."*

---

## C. Ghi nhận — không cần hành động

Các điểm nhóm phát triển đã kiểm chứng và tài liệu ghi đúng:

| Nội dung | Kiểm chứng trên |
|---|---|
| Chỉ Google Sheets API đọc được file bị chặn tải xuống | File thật của chủ đầu tư; Drive export và tải trực tiếp đều hỏng |
| Mã căn duy nhất trong phạm vi tòa nhà | Đúng, và tốt hơn đề xuất ban đầu của nhóm phát triển |
| Tầng 8 và 8A là hai tầng khác nhau | File `Cao tầng Op1` có cả hai |
| Ô gộp trong file mang thông tin penthouse và duplex | Đọc được qua Sheets API và SheetJS |
| Ô trống trong cột Tình trạng nghĩa là Còn hàng | 51/55 dòng file Imperia |
| Cột Tình trạng trộn lẫn trạng thái bán với phân loại quỹ | File Alumi ghi `Độc quyền` và `Đã bán` cùng cột |

---

## D. Đối chiếu prototype với SRS v3.0

**Đã khớp:** FR-40 đến FR-58, FR-61 đến FR-69, FR-70 đến FR-74. Ba nhóm này gần như một-một với những gì đang chạy.

**Prototype vượt SRS:**

| Hạng mục | Ghi chú |
|---|---|
| Bộ đọc sheet Tòa | Chờ quyết định A-01. Đã chạy, kết quả trung thực hơn dựng từ danh sách |
| Vô hiệu hóa trục làm khu vực chung | Mục 1.3 đang loại khỏi phạm vi |
| Bộ lọc tab Quỹ căn | Xem B-03 |

**SRS vượt prototype:**

| Hạng mục | Vì sao chưa làm |
|---|---|
| FR-55 xóa mềm sau khi kiểm tra tham chiếu | Chờ endpoint lưu và lược đồ CSDL |
| FR-56 màn hình lịch sử nhập, khôi phục | Chờ endpoint lưu |
| FR-58 hồ sơ định dạng theo chủ đầu tư | Chờ endpoint lưu |

Cả ba đều chặn bởi cùng một hạng mục: **hệ thống chưa có endpoint ghi dữ liệu**. Đây hiện là nút thắt lớn nhất của toàn dự án — template, nội dung biên tập, cấu hình dự án và hồ sơ định dạng đều đang chờ nó.

---

## E. Đề nghị cách xử lý

| Việc | Thành phần | Thời lượng |
|---|---|---|
| Họp chốt phần A | BA + QLGD + PO | 45 phút |
| Trả lời phần B | BA, bằng văn bản | — |
| Thiết kế lược đồ CSDL và endpoint ghi | Nhóm phát triển + người nắm CSDL cũ | Ưu tiên cao nhất |

**Nên làm trước tiên:** mục A-01. Nếu chốt giữ Kiểu 1 thì bộ đọc sheet Tòa đã sẵn sàng, không phát sinh thêm công. Nếu chốt bỏ thì nhóm phát triển gỡ khỏi mã nguồn để tránh hai đường xử lý song song.
