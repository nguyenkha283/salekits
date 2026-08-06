# Ghi chú bổ sung — SRS v3.1, phần Bảng hàng

**Gửi:** BA · **Từ:** Nhóm phát triển · **Ngày:** 06/08/2026
**Phạm vi:** rà soát sau khi nhận SRS v3.1

---

## Ghi nhận trước

Bản v3.1 xử lý **trọn vẹn** cả 11 mục trong phiếu rà soát trước (A-01 đến A-04, B-01 đến B-07). Riêng hai chỗ BA quyết định khác đề xuất của nhóm phát triển và **quyết định của BA đúng hơn**:

**Bỏ hẳn chỉ số độ phủ.** Nhóm phát triển đề xuất chia hai ngưỡng; BA bỏ luôn với lý do *"ở Kiểu 1 template lấy từ file nên dữ liệu phủ thấp là đúng bản chất của một file quỹ căn, cảnh báo khi đó là cảnh báo sai"*. Lập luận này đúng — chỉ số độ phủ chỉ có nghĩa khi hệ thống phải **suy** lưới từ danh sách. Nhóm phát triển sẽ gỡ phần này khỏi prototype.

**Sheet template chỉ đọc ở lần nhập đầu tiên.** Chi tiết này nhóm phát triển không nghĩ tới. Thiếu nó thì mỗi lần đồng bộ lại sẽ ghi đè cấu trúc QLGD đã chỉnh, mâu thuẫn với chính FR-68.

Bốn điểm dưới đây là phần còn thiếu, không phải lỗi.

---

## 🔴 1. Chưa có yêu cầu chức năng cho dự án thấp tầng

**Hiện trạng:** tài liệu nhắc *"thấp tầng"* 6 lần nhưng không có FR nào quy định hành vi hệ thống.

**Bối cảnh:** phía nghiệp vụ đã chốt trong buổi làm việc gần nhất:

- Màn Khởi tạo dự án có thêm trường **Loại hình** — Cao tầng hoặc Thấp tầng
- Dự án thấp tầng **không có tab Bảng hàng** dạng lưới
- Căn hiển thị ở **Quỹ căn** dạng phẳng và định vị bằng pin trên **Mặt bằng quỹ căn**

**Lý do:** bảng hàng dạng lưới định vị căn bằng cặp *(tầng, trục)* — khái niệm không tồn tại ở liền kề, biệt thự, shophouse. Mỗi căn là một lô đất riêng.

**Đề nghị bổ sung ba FR:**

| Mã đề xuất | Nội dung |
|---|---|
| FR-40a | Màn Khởi tạo dự án có trường Loại hình, hai giá trị Cao tầng và Thấp tầng, bắt buộc chọn |
| FR-69f | Dự án Thấp tầng không hiển thị tab Bảng hàng. Căn hiển thị ở Quỹ căn và Mặt bằng quỹ căn |
| FR-69g | Loại hình đổi được cho tới khi nhập bảng hàng lần đầu; sau đó khóa |

**Trạng thái prototype:** đã cài xong cả ba.

---

## 🔴 2. Chưa có cơ chế cảnh báo chọn nhầm sheet giữa hai loại hình

**Hiện trạng:** không có FR nào.

**Bối cảnh:** một dự án thực tế có thể vừa có cao tầng vừa có thấp tầng. QLGD thường đặt mỗi loại một sheet trong cùng file, và rất dễ chọn nhầm khi nhập.

**Khác biệt nhận diện được từ dữ liệu:**

| Dấu hiệu | Kết luận |
|---|---|
| Không có cột Tầng | Thấp tầng |
| Có cột *Số tầng* mà không có cột *Tầng* | Thấp tầng — nhà phố, biệt thự |
| Cột Tầng chỉ vài giá trị nhỏ, mỗi giá trị nhiều căn | Thấp tầng — cột đó là quy mô nhà |
| Nhiều tầng, mỗi tầng nhiều căn | Cao tầng |

**Điểm then chốt: cột `Số tầng` khác cột `Tầng`.**

Tài liệu nhắc *"Số tầng"* đúng một lần, trong phần mô tả. Đây là khái niệm cần tách bạch trong phụ lục 7.4:

- **Tầng** — vị trí của căn trong tòa. Chỉ có ở cao tầng.
- **Số tầng** — quy mô của căn. Nhà phố 5 tầng, biệt thự 3 tầng. Chỉ có ở thấp tầng.

Nếu importer không tách hai khái niệm, bảng hàng nhà phố 5 tầng sẽ bị hiểu thành tòa nhà có 5 tầng, và toàn bộ lưới dựng sai.

**Đề nghị:**

| Mã đề xuất | Nội dung |
|---|---|
| FR-45a | Phụ lục 7.4 tách hai cột: *Tầng* (vị trí, chỉ cao tầng) và *Số tầng* (quy mô, chỉ thấp tầng) |
| FR-51a | Hệ thống suy bố cục của từng sheet từ dữ liệu, **không dựa vào tên sheet** |
| FR-51b | Khi bố cục sheet không khớp Loại hình dự án, hệ thống cảnh báo kèm lý do cụ thể. Cảnh báo, không chặn |

**Ghi chú về mức độ:** đề nghị **cảnh báo chứ không chặn**, vì bộ nhận diện dựa trên phỏng đoán và có thể sai với dự án lạ. Chặn nhầm một file đúng gây khó chịu hơn cho qua một file sai đã có cảnh báo rõ ràng. Cần BA xác nhận lựa chọn này.

**Trạng thái prototype:** đã cài xong, kiểm chứng trên bốn kịch bản gồm cả trường hợp cột tên là *"Tầng"* nhưng chứa quy mô nhà.

---

## 🟠 3. Phụ lục 7.5 chưa nói cách nhận diện sheet template

**Hiện trạng:** phụ lục 7.5 mô tả đầy đủ **nội dung** sheet template nhưng không nói hệ thống **nhận ra** nó bằng cách nào. Bước 23 chỉ ghi *"File có sheet template là Kiểu 1"*.

**Vấn đề:** tên sheet trong file thật rất đa dạng — `TÒA TEST1 (T1)`, `TÒA S1 (C3L1)`, `TÒA N3(C1Z1)`. Nhận diện theo tên sẽ hỏng ngay với chủ đầu tư đặt tên khác.

**Cách nhóm phát triển đang làm:** nhận diện theo **cấu trúc** — sheet nào có ô `TẦNG/CĂN` ở cột đầu tiên thì là sheet template. Mỗi lần gặp lại ô đó là mở một khối mới. Đã kiểm chứng trên file `Cao tầng Op1`: đọc đúng 3 khối, ô gộp view phủ 5/11/3 trục, duplex thông trục ở tầng 25, penthouse thông tầng 26–27.

**Đề nghị:** bổ sung vào phụ lục 7.5 một dòng về dấu hiệu nhận diện, và ghi rõ đây là **quy ước bắt buộc** trong file mẫu phát cho các đội.

**Câu cần chốt:** ô mở đầu khối bắt buộc ghi đúng `TẦNG/CĂN`, hay chấp nhận các cách viết khác?

---

## 🟠 4. Ba điểm câu chữ cần chỉnh

### 4.1. FR-69c đang giới hạn quá chặt

**Hiện trạng:** *"Với file Kiểu 1, hệ thống nhận diện ô trống giữa dải trục là khu vực chung… Yêu cầu này không áp dụng cho Kiểu 2."*

**Vấn đề:** câu cuối có thể hiểu là Kiểu 2 **không được có** khu vực chung. Thực tế chỉ *tự nhận diện* là không làm được; QLGD vẫn đánh dấu tay trên lưới được, và trình soạn lưới vốn dùng chung cho cả hai kiểu theo FR-69e.

**Đề nghị sửa:** *"Tự nhận diện chỉ áp dụng cho Kiểu 1. Với cả hai kiểu, QLGD đánh dấu khu vực chung thủ công trên trình soạn lưới."*

### 4.2. FR-74a nên nói rõ hệ quả

**Hiện trạng:** đã cảnh báo `IMPORTRANGE` không mang thông tin ô gộp.

**Đề nghị bổ sung một câu cho QLGD hiểu hệ quả:** file Kiểu 1 đưa vào qua bảng trung gian sẽ **tụt xuống thành Kiểu 2** — mất khối penthouse, ô gộp view và khu vực chung. Nếu bố cục quan trọng thì nên nhập file gốc một lần để lấy template, rồi mới dùng bảng trung gian cho các lần cập nhật dữ liệu sau.

### 4.3. OI-10 cần chốt sớm

**Hiện trạng:** FR-84 đến FR-91 (thứ tự quỹ và bộ lọc tab Quỹ căn) đánh dấu *chờ xác nhận*, ghi chú *"chưa có trong biên bản của các vòng làm việc trước"*.

**Thực tế:** tám yêu cầu này đến từ chỉ đạo trực tiếp của phía nghiệp vụ trong buổi làm việc gần nhất, và nhóm phát triển **đã cài xong toàn bộ**.

**Đề nghị:** đưa vào biên bản chính thức để gỡ trạng thái chờ. Nếu vòng làm việc chính thức bác đi thì cần báo sớm để gỡ khỏi mã nguồn.

---

## Đối chiếu prototype với v3.1

**Nhóm phát triển sẽ chỉnh theo tài liệu:**

| Việc | Theo yêu cầu |
|---|---|
| Gỡ chỉ số độ phủ | Quyết định của BA ở v3.1 |
| Đổi khớp dữ liệu sang bộ ba Tòa, Tầng, Căn | FR-69b — hiện chỉ khớp theo mã trục, file nhiều tòa có thể lấy nhầm |
| Chỉ đọc sheet template ở lần nhập đầu | FR-69a |

**Đang chờ tài liệu bổ sung:** ba nhóm FR ở mục 1 và 2 — đã cài nhưng chưa có căn cứ trong SRS.

**Chặn bởi hạ tầng, chưa làm được:** FR-55 xóa mềm, FR-56 lịch sử nhập và khôi phục, FR-58 hồ sơ định dạng theo chủ đầu tư, FR-68 lưu template theo tòa. Cả bốn đều chờ **endpoint ghi dữ liệu** — hiện là nút thắt lớn nhất của dự án.

---

## Đề nghị

| Việc | Cách xử lý |
|---|---|
| Mục 1 và 2 — bổ sung 6 FR | BA soạn, không cần họp |
| Mục 3 — dấu hiệu nhận diện sheet template | Cần một câu trả lời từ nghiệp vụ |
| Mục 4 — ba điểm câu chữ | BA sửa trực tiếp |
| OI-10 | Đưa vào biên bản, ưu tiên |
| Endpoint ghi dữ liệu | Cần buổi làm việc với người nắm CSDL hiện hữu |
