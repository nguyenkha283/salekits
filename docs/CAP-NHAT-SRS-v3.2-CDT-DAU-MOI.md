# Ghi chú cập nhật SRS v3.2 — Quản lý chủ đầu tư và Đầu mối liên hệ

**Gửi:** BA · **Từ:** Nhóm phát triển · **Ngày:** 12/08/2026
**Phạm vi:** những gì đã dựng trong prototype cho hai module này, và những chỗ SRS cần sửa cho khớp

---

## Cách đọc tài liệu

Bốn nhóm, phân biệt bằng ký hiệu:

| Ký hiệu | Nghĩa |
|---|---|
| 🟢 | **Đã dựng, khớp SRS** — chỉ cần thêm FR vào tài liệu |
| 🔴 | **Đã dựng, MÂU THUẪN với SRS hiện hành** — phải sửa SRS, nếu không hai tài liệu nói khác nhau khi nghiệm thu |
| 🟡 | **Đã dựng, mở rộng ngoài SRS** — cần BA xác nhận có giữ không |
| ⚪ | **Chưa dựng** — ghi lại để không rơi |

---

# Phần A — Mâu thuẫn với SRS hiện hành

## 🔴 A-01. Địa giới hành chính hai cấp

**SRS hiện hành:** FR-08 và phụ lục 7.1 quy định ba cấp *Tỉnh → Quận/Huyện → Phường/Xã*.

**Đã dựng:** hai cấp *Tỉnh/Thành phố → Phường/Xã*, 34 tỉnh thành.

**Căn cứ:** Nghị quyết 202/2025/QH15, hiệu lực 01/07/2025. Cấp huyện đã chấm dứt hoạt động; cả nước còn 34 đơn vị cấp tỉnh và 3.320 phường/xã.

Nhóm phát triển đã nêu ở **B-09 (SRS v2.1)** và **mục 7.6 (đề xuất v3)**, cả hai lần chưa có phản hồi. Mã nguồn đang chạy trước tài liệu.

**Đề nghị sửa:**

| Mã | Nội dung |
|---|---|
| FR-08 | Địa giới dự án khai theo hai cấp: Tỉnh/Thành phố rồi Phường/Xã. Chọn tỉnh trước, danh sách phường lọc theo tỉnh. Đổi tỉnh thì xóa lựa chọn phường cũ |
| FR-08a | Trường **Địa chỉ** nhập tự do, chứa số nhà, tên đường, tên khu |
| FR-08b | Danh mục hành chính lấy từ API danh mục dùng chung, không hard-code trong mã nguồn |
| Phụ lục 7.1 | Bỏ cột Quận/Huyện; đổi `district` thành `ward` |

**Còn thiếu — cần BA quyết:** đề xuất B-09 có vế thứ hai *"giữ thêm một trường tự do cho địa danh cũ"*. Hơn 200 dự án đang lưu địa chỉ theo tên quận/huyện đã bỏ. Trường Địa chỉ tự do tạm chứa được, nhưng chưa có luồng chuyển đổi dữ liệu cũ.

---

## 🔴 A-02. Đầu mối liên hệ tách thành bảng riêng

**Đặc tả module hiện hành:** FR-CDT-10 — *"Bốn trường đầu mối liên hệ nằm trên bản ghi dự án, không nằm trên bản ghi chủ đầu tư"*.

**Đã dựng:** bảng riêng `project_contacts`, dự án trỏ tới bằng khóa ngoại `contact_id`.

**Ý định nghiệp vụ ở mục 1.2 vẫn nguyên vẹn.** Lý do đặc tả đưa ra là *"đặt đầu mối trong bản ghi chủ đầu tư thì mỗi chủ đầu tư chỉ có một đầu mối, không phản ánh đúng thực tế"*. Mô hình mới vẫn cho mỗi dự án một đầu mối riêng và mỗi chủ đầu tư nhiều đầu mối. Chỉ mô hình vật lý đổi, để hai dự án cùng làm việc với một người dùng chung một bản ghi thay vì nhập trùng hai lần.

**Đề nghị sửa:**

| Mã | Nội dung |
|---|---|
| FR-CDT-10 | Đầu mối liên hệ lưu ở bảng riêng, gắn với chủ đầu tư. Dự án tham chiếu tới một đầu mối. Trường đầu mối của dự án là tùy chọn |
| FR-CDT-10a | **Số điện thoại là thứ định danh đầu mối.** Một số điện thoại chỉ có một bản ghi trên toàn hệ thống |
| FR-CDT-10b | Số điện thoại được **chuẩn hóa trước khi so trùng**: bỏ ký tự không phải chữ số, quy `+84`/`84` về `0`, bù số `0` đầu nếu thiếu. `+84 912 345 678`, `0912.345.678` và `912345678` là cùng một số |
| FR-CDT-10c | Khi tạo dự án, nếu số điện thoại đã có bản ghi thì hệ thống **dùng lại bản ghi cũ và không ghi đè** thông tin đã có |
| Phụ lục | Thêm bảng `project_contacts`; bỏ bốn cột `contact_*` khỏi bảng dự án |

**Vì sao chuẩn hóa là bắt buộc, không phải tùy chọn:** so trùng trên chuỗi thô thì ba cách gõ trên là ba chuỗi khác nhau, ràng buộc duy nhất cho qua cả ba — đúng thứ bảng này sinh ra để ngăn.

---

## 🔴 A-03. APM được tạo chủ đầu tư

**SRS hiện hành:** ma trận phân quyền mục 2.5, dòng *"Quản lý danh mục dùng chung"* — **chỉ Admin hệ thống**.

**Đã dựng:** nhóm Người tạo dự án (APM, Trợ lý dự án, Hành chính dự án) tạo được chủ đầu tư từ dashboard và ngay trong màn Khởi tạo dự án.

Đặc tả module đã yêu cầu sửa ở mục 7.3, nhưng SRS chưa cập nhật. **Đây là mâu thuẫn đang tồn tại giữa hai tài liệu**, không phải do prototype.

**Đề nghị sửa:** ma trận mục 2.5, dòng "Quản lý danh mục dùng chung" đổi thành *"Nhóm Người tạo dự án: tạo mới và sửa bản ghi do mình tạo. Admin: toàn quyền"*.

---

# Phần B — Đã dựng, khớp SRS, cần thêm FR

## 🟢 B-01. Vai trò Ban lãnh đạo

Ma trận mục 4 của đặc tả module vốn đã có cột **BLĐ**. Bộ chọn vai trò trong prototype mới là thứ thiếu nó. Đã bổ sung vào cả CMS lẫn dashboard.

| Mã | Nội dung |
|---|---|
| FR-CDT-20 | Ban lãnh đạo xem được mọi tab của CMS, kể cả tab hạn chế, nhưng không sửa nội dung nào |
| FR-CDT-21 | Ban lãnh đạo xem được toàn bộ dự án trên hệ thống ở chế độ chỉ xem |

## 🟢 B-02. Phạm vi nhìn thấy đầu mối liên hệ

Cụ thể hóa FR-CDT-11:

| Mã | Nội dung |
|---|---|
| FR-CDT-11a | Ban lãnh đạo và Admin: xem toàn bộ đầu mối của mọi chủ đầu tư |
| FR-CDT-11b | Trưởng line: chỉ xem đầu mối gắn với dự án thuộc line mình phụ trách |
| FR-CDT-11c | Nhóm Người tạo dự án: xem đầu mối gắn với dự án do mình tạo, hoặc đầu mối do chính mình tạo |
| FR-CDT-11d | Quản lý giao dịch và Quản lý tin tức: **không xem được**, kể cả khi thuộc đội ngũ dự án |
| FR-CDT-11e | Màn chi tiết chủ đầu tư hiển thị từng đầu mối kèm danh sách dự án gắn với đầu mối đó, danh sách này cũng lọc theo cùng phạm vi |
| FR-CDT-11f | Cột "Số đầu mối" ở danh sách chủ đầu tư đếm theo phạm vi của vai trò đang xem, không phải tổng toàn hệ thống |

**Lý do FR-CDT-11f:** nếu hiện tổng thì Ban lãnh đạo và APM thấy cùng một con số nhưng bấm vào lại ra hai danh sách khác nhau.

## 🟢 B-03. Chống trùng chủ đầu tư

| Mã | Nội dung |
|---|---|
| FR-CDT-02a | Ba mức so khớp áp dụng đồng thời: khớp chuỗi con; bỏ dấu và bỏ phân biệt hoa thường; bỏ tiền tố pháp nhân ở cả từ khóa lẫn tên bản ghi |
| FR-CDT-02b | Popup tạo chủ đầu tư mới **tự dò trùng trong lúc gõ tên**, hiện tối đa 4 bản ghi gần giống kèm lối dùng lại bản ghi có sẵn |
| FR-CDT-02c | Cảnh báo trùng không chặn thao tác — hai doanh nghiệp tên gần giống nhau là tình huống có thật |

**Giới hạn đã biết, giữ nguyên theo đặc tả mục 3.2:** gõ tên viết tắt tự đặt (`VHM`) không tìm ra. Cần thêm trường tên viết tắt ở phase sau.

## 🟢 B-04. Chủ đầu tư bắt buộc khi khởi tạo dự án

| Mã | Nội dung |
|---|---|
| FR-CDT-19a | Ô chọn chủ đầu tư ở màn Khởi tạo dự án có gợi ý theo tên và lối thêm mới ngay tại chỗ |
| FR-CDT-19b | Chủ đầu tư ở trạng thái *Ngừng sử dụng* không hiện trong gợi ý, nhưng dự án cũ đang tham chiếu vẫn giữ nguyên |
| FR-CDT-19c | Đổi chủ đầu tư thì xóa lựa chọn đầu mối cũ, vì đầu mối là người của chủ đầu tư |

## 🟢 B-05. Ràng buộc xóa

| Mã | Nội dung |
|---|---|
| FR-CDT-15a | Chủ đầu tư đang được dự án tham chiếu thì không xóa được. Hệ thống nêu rõ số dự án đang tham chiếu và hướng sang trạng thái *Ngừng sử dụng* |
| FR-CDT-15b | Xóa đầu mối không làm hỏng bản ghi dự án; trường đầu mối của dự án trở về rỗng |

---

# Phần C — Mở rộng ngoài SRS, cần BA xác nhận

## 🟡 C-01. APM xem được đầu mối do chính mình tạo

FR-CDT-11 ghi *"Người tạo dự án **của dự án đó**"*. Quy tắc đã dựng thêm vế *"hoặc đầu mối do chính mình tạo"* — APM tạo một đầu mối rồi dự án chuyển cho người khác thì vẫn xem được.

## 🟡 C-02. Ảnh đại diện dự án upload tay

Mục 2.6 và FR-22 quy định mọi ảnh đến từ Google Drive. Ảnh đại diện dự án là **ngoại lệ**: upload trực tiếp ở màn Khởi tạo dự án, không đi qua Drive nên không bị ghi đè khi đồng bộ lại.

Cần xác nhận đây là trường **khác** với ảnh hero banner ở B-06/7.4. Nếu phía nghiệp vụ hiểu hai thứ là một thì mỗi lần đồng bộ sẽ mất ảnh vừa upload.

| Mã đề nghị | Nội dung |
|---|---|
| FR-22a | Ảnh đại diện dự án upload trực tiếp, PNG hoặc JPG, tối đa 5 MB. Không đồng bộ từ Drive và không bị đồng bộ ghi đè |
| FR-22b | Ảnh đại diện tách biệt với băng ảnh đầu trang; băng ảnh đầu trang vẫn lấy từ `01. Tổng quan / Ảnh hero banner` |

## 🟡 C-03. Link Drive không bắt buộc khi khởi tạo

| Mã đề nghị | Nội dung |
|---|---|
| FR-40b | Link thư mục Drive là trường tùy chọn ở màn Khởi tạo dự án |
| FR-40c | Không nhập link Drive thì dự án vào CMS với **toàn bộ nội dung trống**. Mỗi mục hiện chỗ trống ghi rõ cần tải gì lên và lấy từ thư mục Drive nào |
| FR-40d | Hệ thống **không dùng dữ liệu mẫu** ở bất kỳ mục nào. Mục chưa có nội dung phải hiện rõ là chưa có |

**Lý do FR-40d:** dữ liệu mẫu làm dự án mới trông như đã đầy nội dung, không ai biết còn thiếu gì trước khi gửi duyệt.

## 🟡 C-04. Khu vực đầu mối trong popup tạo chủ đầu tư

Đầu mối tạo theo đường này gắn với **chủ đầu tư**, chưa gắn dự án nào — hơi lệch với cách đặc tả mô tả đầu mối như thuộc tính của dự án. Khu vực này chỉ hiện với người tạo bản ghi chủ đầu tư.

---

# Phần D — Rủi ro và điểm mở

## RR-04 mở rộng — cần xác nhận lại

Rủi ro RR-04 (thu thập ngày sinh và sở thích của người ngoài tổ chức mà không có sự đồng ý) đã được nghiệp vụ chấp nhận, nhưng **với phạm vi hẹp hơn hiện tại**. Hai thay đổi mở rộng phạm vi người đọc:

- Bản ghi dùng chung: APM của dự án B đọc và **sửa được** ghi chú do APM của dự án A nhập
- Ban lãnh đạo xem được toàn bộ ngày sinh và ghi chú của mọi đại diện chủ đầu tư

## Điểm mở

| Mã | Nội dung | Ảnh hưởng nếu không xử lý |
|---|---|---|
| OI-05 | Ràng buộc duy nhất theo số điện thoại áp dụng **toàn hệ thống**. Một người đại diện cho hai chủ đầu tư khác nhau sẽ không tạo được bản ghi thứ hai | Nếu tình huống có thật, khóa duy nhất phải đổi thành `(chủ đầu tư, số điện thoại)` |
| OI-06 | Chưa có luồng gộp hai bản ghi đầu mối trùng | Cùng lỗ hổng với OI-02 của chủ đầu tư |
| OI-07 | Đầu mối đổi số trùng với bản ghi khác thì lệnh sửa bị chặn, không có hướng xử lý | Người dùng bế tắc, phải nhờ Admin |
| OI-08 | Đầu mối nghỉ việc ở chủ đầu tư: chưa có trạng thái ngừng dùng cho đầu mối | Danh sách đầu mối phình dần, chọn nhầm người đã nghỉ |

---

# Phần E — Chưa dựng

| Mã | Nội dung | Nguồn |
|---|---|---|
| ⚪ E-01 | Vai trò **Admin** — chưa có trong hệ thống, nên UC-CDT-05 (chuyển trạng thái CĐT) và UC-CDT-06 (chuyển quyền sở hữu bản ghi) hiện **không vai trò nào làm được** | Ma trận mục 4 đặc tả |
| ⚪ E-02 | Vai trò **Quản lý tin tức** (QLTT) — ma trận có, danh sách vai trò trong mã nguồn không có. Hiện đang dùng "Marketing" thay thế | Ma trận mục 4 đặc tả |
| ⚪ E-03 | Trang công khai của chủ đầu tư | FR-CDT-16 → FR-CDT-18 |
| ⚪ E-04 | Ký hiệu tòa và độ rộng tầng/căn khai ở màn Khởi tạo dự án, phục vụ tách mã căn dạng dính liền | Mục 2.3 đề xuất SRS v3 |
| ⚪ E-05 | Danh mục phường/xã đầy đủ — prototype mới có dữ liệu mẫu cho 13 tỉnh thành lớn trên tổng số 34 | A-01 ở trên |
| ⚪ E-06 | Endpoint đọc danh sách dự án cho dashboard — dự án vừa tạo chưa hiện ra trong danh sách | — |
| ⚪ E-07 | Luồng duyệt và nhật ký thao tác cho bản ghi chủ đầu tư | Mục 6 đặc tả |

---

## Tóm tắt việc cần BA làm

1. **Chốt A-01, A-02, A-03** — ba mâu thuẫn thật giữa mã nguồn và tài liệu. Không chốt thì nghiệm thu sẽ vướng.
2. **Xác nhận C-01 đến C-04** — giữ hay bỏ bốn mở rộng.
3. **Xác nhận lại RR-04** với phạm vi người đọc mới.
4. **Trả lời OI-05** — quyết định này ảnh hưởng tới cấu trúc bảng, sửa sau khi có dữ liệu thật sẽ tốn kém.
5. **Bổ sung vai trò Admin và QLTT** (E-01, E-02) — hiện có hai use case không ai thực hiện được.
