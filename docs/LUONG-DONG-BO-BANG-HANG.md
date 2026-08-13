# Luồng đồng bộ bảng hàng lên hệ thống

**Phạm vi:** mô tả chi tiết luồng nhập bảng hàng của một dự án, từ khi QLGD
đưa nguồn dữ liệu vào tới khi lưới bảng hàng hiển thị công khai.
**Cơ sở:** SRS mục 3.5, 3.6, các use case UC-10 đến UC-15, phụ lục 7.4 đến 7.7,
và mã nguồn `src/detail/inventoryParser.ts` đang chạy.
**Ngày:** 13/08/2026

---

## Tác nhân và điều kiện

Người thực hiện là Người quản lý giao dịch (QLGD) phụ trách dự án, thao tác trên
máy tính để bàn. Trước khi bắt đầu, cần: Google Sheets API đã được bật, và
service account của hệ thống đọc được file nguồn của chủ đầu tư.

---

## Sơ đồ luồng

```
        ┌─────────────────────────┐
        │  1. Nhận nguồn          │  Link Google Sheet hoặc file Excel
        └───────────┬─────────────┘
                    ▼
        ┌─────────────────────────┐
        │  2. Phân loại sheet     │  Căn / quỹ / bỏ qua
        └───────────┬─────────────┘
                    ▼
        ┌─────────────────────────┐
        │  3. Dò tiêu đề,         │  QLGD sửa ánh xạ nếu hệ thống đoán sai
        │     ánh xạ cột          │
        └───────────┬─────────────┘
                    ▼
        ┌─────────────────────────┐   thiếu cột    ┌──────────────┐
        │  4. Kiểm 7 cột bắt buộc │ ─────────────► │  DỪNG        │
        └───────────┬─────────────┘                │  báo cột lỗi │
                    ▼                               └──────────────┘
        ┌─────────────────────────┐
        │  5. Quy đổi và kiểm giá │  Tình trạng, quỹ, công thức VAT
        └───────────┬─────────────┘
                    ▼
        ┌─────────────────────────┐
        │  6. So với dữ liệu cũ   │  Lệch > 30% số căn và > 20 căn → chặn
        └───────────┬─────────────┘
                    ▼
        ┌─────────────────────────┐
        │  7. Xác nhận, lưu file  │  Ghi đè dữ liệu căn, xóa mềm căn biến mất
        │     gốc                 │
        └───────────┬─────────────┘
                    ▼
        ┌─────────────────────────┐
        │  8. Dựng lưới, QLGD     │  Gộp ô, tách trục; template giữ qua các lần
        │     soạn                │
        └───────────┬─────────────┘
                    ▼
        ┌─────────────────────────┐
        │  9. Hiển thị công khai  │
        └─────────────────────────┘
```

Bốn bước 4, 5, 6 và 7 là các chốt kiểm tra — nơi hệ thống có thể chặn hoặc
cảnh báo trước khi cho dữ liệu đi tiếp.

---

## Chi tiết từng bước

### 1. Nhận nguồn

QLGD dán link Google Sheet hoặc tải file Excel lên. Link Sheet là con đường được
ưu tiên vì nó cho phép theo dõi thay đổi về sau (xem phần Theo dõi thay đổi từ
nguồn). File Excel tải lên là một lần chụp tĩnh, không theo dõi được.

### 2. Phân loại sheet

Một file thật thường có nhiều sheet. Hệ thống liệt kê ra và QLGD phân mỗi sheet
vào ba loại:

- **Sheet dữ liệu căn** — danh sách phẳng, mỗi dòng một căn.
- **Sheet khai báo quỹ** — mỗi sheet là một quỹ, nội dung là danh sách mã căn.
  Chỉ dùng khi file không có cột Quỹ. Khi file có cả cột Quỹ lẫn sheet quỹ, hệ
  thống ưu tiên cột Quỹ và cảnh báo các dòng lệch nhau giữa hai nguồn.
- **Sheet bỏ qua** — hướng dẫn, quy trình mà chủ đầu tư kèm theo file mẫu.

### 3. Dò tiêu đề và ánh xạ cột

Đây là bước xử lý nhiều nhất. Hệ thống tự dò dòng tiêu đề, vì mỗi file đặt tiêu
đề ở một vị trí khác nhau và nhiều file còn có dòng nhãn nhóm giá gộp ô phía
trên. Sau đó hệ thống khớp tên cột với danh mục cách viết đồng nghĩa, sau khi bỏ
dấu và chuẩn hóa: "DT thông thủy", "Diện tích TT", "Thông thủy" đều quy về một
trường.

Một điểm tinh tế đã xử lý trong mã nguồn: phân biệt cột **Tầng** (vị trí của căn
trong tòa) với cột **Số tầng** (quy mô của căn nhà phố, biệt thự). Hai cột này
tên gần giống nhau nhưng ý nghĩa khác hẳn; nhầm là dựng sai lưới. QLGD xác nhận
hoặc sửa ánh xạ nếu hệ thống đoán sai.

### 4. Kiểm bảy cột bắt buộc

Bảy cột bắt buộc trên sheet dữ liệu căn: **Tòa, Tầng, Căn, Mã căn, Giá, Tình
trạng, Diện tích thông thủy**. Thiếu bất kỳ cột nào thì hệ thống dừng và báo rõ
sheet, cột lỗi. Đây là chốt chặn cứng, không cho qua.

Với dự án thấp tầng, cột Tầng và Căn không tồn tại theo nghĩa vị trí. Khi đó hệ
thống dùng cột Phân khu thay cho Tòa, và mã căn là định danh duy nhất của từng
lô.

### 5. Quy đổi và kiểm toàn vẹn giá

Hệ thống quy giá trị Tình trạng và Quỹ theo danh mục đồng nghĩa. Ô trống ở cột
Tình trạng nghĩa là Còn hàng. Sau đó chạy các phép kiểm giá:

| Loại giá | Quan hệ |
|---|---|
| Tổng giá trị có VAT, chưa phí bảo trì | = giá chưa VAT × 1,10 |
| Tổng giá trị hợp đồng mua bán | = giá chưa VAT × 1,12 |
| Đơn giá | = tổng giá ÷ diện tích thông thủy |

Hai công thức nhân đã được kiểm chứng đúng trên toàn bộ dữ liệu của hai file
thật. Khi phát hiện lệch quá sai số làm tròn, nguyên nhân thường là ánh xạ cột
sai chứ không phải dữ liệu sai — nên hệ thống cảnh báo chứ không chặn.

### 6. So với dữ liệu cũ

Hệ thống so dữ liệu mới với dữ liệu đang có. Nếu khác biệt vượt **30% số căn và
trên 20 căn** thì chặn và yêu cầu xác nhận có ý thức. Ngưỡng kép này tránh chặn
nhầm dự án nhỏ: một dự án 10 căn đổi 4 căn là 40% nhưng vẫn là thao tác bình
thường.

### 7. Xác nhận và ghi đè

Hệ thống hiển thị hộp thoại xác nhận với nội dung: *"Hành động này ghi đè toàn bộ
dữ liệu căn hiện có. File gốc được lưu lại, khôi phục thủ công qua màn hình lịch
sử nhập."*

Sau khi QLGD xác nhận, hệ thống:

1. Lưu file gốc của lần nhập này.
2. Cập nhật dữ liệu căn.
3. Xóa mềm các căn không còn trong file mới, sau khi kiểm tra tham chiếu. Không
   xóa cứng, để còn khôi phục được.

### 8. Dựng và soạn lưới

Hệ thống tự dựng lưới từ danh sách căn, rồi QLGD tinh chỉnh: gộp và tách ô ở dòng
tiêu đề, gộp ô căn theo chiều ngang hoặc dọc cho duplex và penthouse, gộp trục,
thêm hoặc xóa trục, tầng và khối, điền các dòng tiêu đề mà file không có. Nếu có
nhóm tòa khác cùng bố cục, QLGD chọn áp template này cho các nhóm đó trong một
thao tác.

Sáu dòng tiêu đề của lưới: Tầng/Căn, Loại hình, Hướng, Diện tích thông thủy,
Diện tích tim tường, View.

Điểm quan trọng: **template lưới thuộc về dự án và giữ nguyên qua các lần nhập
sau** — lần nhập sau chỉ thay dữ liệu căn, không phải soạn lại lưới. Nếu lần nhập
mới có căn thuộc tầng hoặc trục chưa có trên lưới, hệ thống báo rõ số căn chưa
hiển thị được và danh sách tầng, trục còn thiếu, thay vì bỏ qua âm thầm. Lý do:
căn không hiển thị là căn không bán được.

### 9. Hiển thị công khai

Lưới bảng hàng sẵn sàng hiển thị trên trang công khai của dự án.

---

## Theo dõi thay đổi từ nguồn

Chỉ áp dụng khi nhập từ link Google Sheet, không áp dụng với file Excel tải lên.

Sau khi nhập, hệ thống kiểm tra thời điểm sửa đổi của file nguồn theo chu kỳ,
giãn theo mức hoạt động của dự án. Khi phát hiện thay đổi, hệ thống thông báo cho
QLGD và cho xem khác biệt giữa dữ liệu hiện tại và file nguồn. QLGD chủ động áp
dụng hoặc bỏ qua; hệ thống không bao giờ tự áp dụng thay đổi lên dữ liệu đang
công bố.

Sau ba lần kiểm tra thất bại liên tiếp, hệ thống báo mất quyền đọc file nguồn.
Hệ thống cũng lưu bản sao dữ liệu của mỗi lần đồng bộ để phòng trường hợp chủ đầu
tư xóa file nguồn.

---

## Khôi phục từ lần nhập trước

Khi dự án đã có ít nhất hai lần nhập, QLGD mở lịch sử nhập, chọn lần cần khôi
phục và xem thông tin: thời điểm, người thực hiện, số căn, ngày hiệu lực. Sau khi
xác nhận, hệ thống nạp lại dữ liệu từ file gốc đã lưu. Việc khôi phục chỉ thay dữ
liệu căn, không đụng tới template lưới.

---

## Khoảng cách giữa tài liệu và mã nguồn hiện tại

Phần đọc và phân tích file đã dựng chắc trong mã nguồn:
`src/detail/inventoryParser.ts` với các hàm `analyzeSheet` (dò tiêu đề, ánh xạ
cột, tách cột giá), `detectLayout` (phân biệt cao tầng và thấp tầng),
`buildInventory` (dựng danh sách căn và nhóm quỹ). Luồng chạy được tới bước dựng
lưới và hiển thị.

Bốn tính năng sau phụ thuộc vào backend ghi dữ liệu, mà endpoint ghi hiện chưa
có, nên chưa dựng trong prototype:

- Lưu file gốc mỗi lần nhập (bước 7).
- Xóa mềm căn biến mất và kiểm tra tham chiếu (bước 7).
- Lịch sử nhập và khôi phục từ lần trước.
- Theo dõi thay đổi từ file nguồn theo chu kỳ.

---

## Tham chiếu SRS

| Nội dung | Vị trí trong SRS |
|---|---|
| Luồng nhập bảng hàng | Mục 3.5 |
| Dựng và soạn lưới | Mục 3.6 |
| Nhập bảng hàng | UC-10 |
| Duyệt và soạn lưới | UC-11 |
| Đối chiếu lưới sau khi nhập lại | UC-12 |
| Gắn dữ liệu lên mặt bằng | UC-13 |
| Theo dõi thay đổi từ nguồn | UC-14 |
| Khôi phục bảng hàng | UC-15 |
| Quy ước file bảng hàng, bảy cột bắt buộc | Phụ lục 7.4 |
| Sheet khai báo quỹ | Phụ lục 7.5 |
| Sáu danh mục dùng chung | Phụ lục 7.6 |
| Cấu hình thuộc về dự án | Phụ lục 7.7 |
