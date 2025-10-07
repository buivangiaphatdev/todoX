import Task from "../models/Task.js";

// Hàm controller getAllTasks để lấy tất cả các task từ database
export const getAllTasks = async (req, res) => {
  const { filter = "today" } = req.query;
  const now = new Date();
  let startDate;

  switch (filter) {
    case "today": {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }
    case "week": {
      const mondayDate =
        now.getDate() - (now.getDay() - 1) - (now.getDay() === 0 ? 7 : 0);
      startDate = new Date(now.getFullYear(), now.getMonth(), mondayDate);
      break;
    }
    case "month": {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case "all":
    default: {
      startDate = null;
    }
  }

  const query = startDate ? { createdAt: { $gte: startDate } } : {};

  try {
    const result = await Task.aggregate([
      { $match: query },
      {
        $facet: {
          tasks: [{ $sort: { createdAt: -1 } }],
          activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
          completeCount: [
            { $match: { status: "complete" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const tasks = result[0].tasks;
    const activeCount = result[0].activeCount[0]?.count || 0;
    const completeCount = result[0].completeCount[0]?.count || 0;

    res.status(200).json({ tasks, activeCount, completeCount });
  } catch (error) {
    console.error("Lỗi khi gọi getAllTasks", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Hàm controller createTask để tạo một task mới trong database
export const createTask = async (req, res) => {
  try {
    // Lấy dữ liệu title từ body của request (client gửi lên)
    const { title } = req.body;

    // Tạo một đối tượng Task mới với dữ liệu vừa lấy
    const task = new Task({ title });

    // Lưu task mới vào database
    const newTask = await task.save();

    // Trả về task vừa tạo kèm mã trạng thái 201 (Created)
    res.status(201).json(newTask);
  } catch (error) {
    // In ra lỗi chi tiết trong console để dễ debug
    console.error("Lỗi khi gọi createTask", error);

    // Trả về phản hồi lỗi với mã trạng thái HTTP 500 (Internal Server Error)
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Hàm controller updateTask để cập nhật thông tin một task theo id
export const updateTask = async (req, res) => {
  try {
    // Lấy dữ liệu title, status, completedAt từ body request
    const { title, status, completedAt } = req.body;

    // Tìm task theo id và cập nhật giá trị mới
    // req.params.id lấy id từ URL (vd: /tasks/:id)
    // { new: true } để trả về object đã được cập nhật thay vì object cũ
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        status,
        completedAt,
      },
      { new: true }
    );

    // Nếu không tìm thấy task theo id, trả về 404 (Not Found)
    if (!updatedTask) {
      return res.status(404).json({ message: "Nhiệm vụ không tồn tại!" });
    }

    // Nếu cập nhật thành công, trả về task đã được cập nhật
    res.status(200).json(updatedTask);
  } catch (error) {
    // In ra lỗi chi tiết trong console để dễ debug
    console.error("Lỗi khi gọi updateTask", error);

    // Trả về phản hồi lỗi với mã trạng thái HTTP 500 (Internal Server Error)
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Hàm controller deleteTask để xóa một task theo id
export const deleteTask = async (req, res) => {
  try {
    // Tìm và xóa task theo id từ database
    const deleteTask = await Task.findByIdAndDelete(req.params.id);

    // Nếu không tìm thấy task để xóa, trả về 404 (Not Found)
    if (!deleteTask) {
      return res.status(404).json({ message: "Nhiệm vụ không tồn tại!" });
    }

    // Nếu xóa thành công, trả về task đã bị xóa
    res.status(200).json(deleteTask);
  } catch (error) {
    // In ra lỗi chi tiết trong console để dễ debug
    console.error("Lỗi khi gọi deleteTask", error);

    // Trả về phản hồi lỗi với mã trạng thái HTTP 500 (Internal Server Error)
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
