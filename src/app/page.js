"use client";
import { CaretUpOutlined } from "@ant-design/icons";
import { createClient } from "@supabase/supabase-js";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Popover,
  Table,
  notification,
} from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ModalExtention from "./modal/ModalExtention";
import ModalResetPassword from "./modal/ModalResetPassword";

const { Search } = Input;
const Dashboard = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userExtention, setUserExtention] = useState(undefined);
  const [userResetPassWord, setUserResetPassWord] = useState(undefined);
  const [openPopover, setOpenPopover] = useState(false);
  const [dataUser, setDataUser] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;
  const supabase = createClient(
    "https://qsucitblvnvexhprzzqa.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdWNpdGJsdm52ZXhocHJ6enFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkwNTY1MjUsImV4cCI6MTk5NDYzMjUyNX0.pzFYFIcnIbkU_dpGFUqD8ypd_yCIyKWS5pUgTI2WYn0"
  );
  useEffect(() => {
    checkSession();
    init();
  }, []);
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
    }
  };

  const init = async () => {
    const { data } = await supabase
      .from("user")
      .select("*")
      .order("created_at", { ascending: true });
    if (!data) return setDataUser([]);
    setDataUser(data);
  };
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  const lockByUser = async (user, status) => {
    await supabase.from("user").update({ active: status }).eq("username", user);
    api["success"]({
      message: "Thành công",
      description: `Thay đổi trạng thái khách hàng ${user} thành công`,
    });
    init();
  };
  const deleteAccountByUser = async (user) => {
    await supabase.from("user").delete().eq("username", user);
    api["success"]({
      message: "Thành công",
      description: `Xóa khách hàng ${user} thành công`,
    });
    init();
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: "Tên khách hàng",
      key: "username",
      dataIndex: "username",
    },
    {
      title: "Ngày tạo",
      key: "created_at",
      dataIndex: "created_at",
      responsive: ["sm"],

      render: (_, record) => {
        return <p>{moment(record.created_at).format("DD-MM-YYYY")}</p>;
      },
    },
    {
      title: "Ngày hết hạn",
      key: "expire_at",
      dataIndex: "expire_at",
      responsive: ["sm"],

      render: (_, record) => {
        return <p>{moment(record.expire_at).format("DD-MM-YYYY")}</p>;
      },
    },
    {
      title: "Trạng thái",
      key: "active",
      responsive: ["sm"],
      dataIndex: "active",
      render: (_, record) => {
        return (
          <p>
            {moment().isAfter(record.expire_at)
              ? "Hết hạn"
              : record.active
              ? "Hoạt động"
              : "Khóa"}
          </p>
        );
      },
    },
    {
      title: "Tùy chọn",
      key: "action",
      width: isMobile ? 300 : 400,
      align: "right",
      render: (_, record) => (
        <div className="flex flex-col md:flex-row justify-center items-center">
          <Button
            type="primary "
            style={{ background: "red" }}
            className="mb-2 md:mb-0"
            onClick={() => {
              lockByUser(record.username, false);
            }}
          >
            Khóa
          </Button>
          <Button
            className="md:block hidden"
            type="primary "
            style={{ background: "green", marginLeft: "10px" }}
            onClick={() => {
              lockByUser(record.username, true);
            }}
          >
            Mở khóa
          </Button>
          <Button
            className="md:block hidden"
            type="primary"
            style={{ background: "black", color: "white", marginLeft: "10px" }}
            onClick={() => {
              deleteAccountByUser(record.username);
            }}
          >
            Xóa
          </Button>

          <Popover
            // open={openPopover == record.username}
            content={() => (
              <div className="md:block grid grid-cols-2 gap 4 w-screen md:w-fit">
                <Button
                  className=" md:hidden"
                  type="primary "
                  style={{ background: "green", marginLeft: "10px" }}
                  onClick={() => {
                    lockByUser(record.username, true);
                  }}
                >
                  Mở khóa
                </Button>
                <Button
                  className=" md:hidden"
                  type="primary"
                  style={{
                    background: "black",
                    color: "white",
                    marginLeft: "10px",
                  }}
                  onClick={() => {
                    deleteAccountByUser(record.username);
                  }}
                >
                  Xóa
                </Button>
                <Button
                  type="primary"
                  style={{ background: "orange" }}
                  onClick={() => {
                    setUserResetPassWord(record.username);
                    setOpenPopover(false);
                  }}
                >
                  Đổi mật khẩu
                </Button>
                <Button
                  type="primary"
                  style={{ background: "blue", marginLeft: "10px" }}
                  onClick={() => {
                    setUserExtention(record.username);
                    setOpenPopover(false);
                  }}
                >
                  Gia hạn
                </Button>
              </div>
            )}
            title=""
            trigger="click"
          >
            <Button
              type="primary"
              style={{ background: "gray", marginLeft: "10px" }}
              onClick={() => setOpenPopover(record.username)}
            >
              <CaretUpOutlined />
            </Button>
          </Popover>
        </div>
      ),
    },
  ];
  const onFinish = async (values) => {
    try {
      await supabase.from("user").upsert(values);
      form.resetFields();
      setIsModalOpen(false);
      api["success"]({
        message: "Thành công",
        description: "Thêm khách hàng thành công",
      });
      init();
    } catch (error) {
      api["error"]({
        message: "Thất bại",
        description: "Thêm khách hàng thất bại",
      });
    }
  };

  const handleSearch = async (value) => {
    const { data } = await supabase
      .from("user")
      .select("*")
      .ilike("username", "%" + value + "%")
      .order("created_at", { ascending: true });
    if (!data) return setDataUser([]);
    setDataUser(data);
  };

  const handleUpdateExtention = async (date) => {
    if (!date) {
      api["error"]({
        message: "Lỗi",
        description: `Vui lòng chọn thời gian gia hạn`,
      });

      return;
    }
    await supabase
      .from("user")
      .update({ expire_at: date })
      .eq("username", userExtention);

    api["success"]({
      message: "Thành công",
      description: `Thay đổi thời gian gia hạn khách hàng ${userExtention} thành công`,
    });
    setUserExtention(false);
    init();
  };

  const handleUpdatePassword = async (password) => {
    if (!password) {
      api["error"]({
        message: "Lỗi",
        description: `Vui lòng nhập mật khẩu mới`,
      });

      return;
    }
    await supabase
      .from("user")
      .update({ password: password })
      .eq("", userResetPassWord);

    api["success"]({
      message: "Thành công",
      description: `Thay đổi thời gian gia hạn khách hàng ${userResetPassWord} thành công`,
    });
    setUserResetPassWord(false);

    init();
  };
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center overflow-scroll bg-white">
      {contextHolder}
      <div className="w-full block md:flex md:justify-end p-5  sticky bg-white">
        <div
          className="!bg-[#1677ff] text-white shadow-md md:top-0 top-10 p-2 md:mr-2 cursor-pointer rounded-md md:mb-0 mb-2 h-fit"
          onClick={showModal}
        >
          Thêm khách hàng mới
        </div>
        <div
          className="!bg-[#1677ff] text-white shadow-md md:top-0 top-10 cursor-pointer p-2 rounded-md h-fit"
          onClick={logout}
        >
          Đăng xuất
        </div>
      </div>

      <div className="w-full h-full block md:flex flex-col justify-center items-center md:mt-[100px]">
        <Card className="w-[80%] mb-2 p-0 text-end">
          <Search
            placeholder="Tìm kiếm"
            allowClear
            size="large"
            onSearch={handleSearch}
            style={{
              width: 300,
            }}
          />
        </Card>
        <Card className="md:w-[80%] block w-screen">
          <Table
            columns={columns}
            dataSource={dataUser}
            rowKey={(p) => p?.username}
            expandable={
              isMobile && {
                expandedRowRender: (record) => (
                  <table class="table-auto">
                    <thead>
                      <tr>
                        <th>Ngày tạo</th>
                        <th>Ngày hết hạn</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <p className="flex justify-center">
                            {moment(record.created_at).format("DD-MM-YYYY")}
                          </p>
                        </td>
                        <td>
                          <p className="flex justify-center">
                            {moment(record.expire_at).format("DD-MM-YYYY")}
                          </p>
                        </td>
                        <td>
                          <p className="flex justify-center">
                            {moment().isAfter(record.expire_at)
                              ? "Hết hạn"
                              : record.active
                              ? "Hoạt động"
                              : "Khóa"}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ),
              }
            }
          />
        </Card>
      </div>

      <Modal
        title="Thêm khách hàng mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={<></>}
        className="flex flex-col"
      >
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            username: null,
            password: null,
            expire_at: null,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Tên tài khoản"
            name="username"
            rules={[
              {
                required: true,
                message: "Nhập tài khoản",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="expire_at"
            label="Ngày hết hạn"
            rules={[
              {
                required: true,
                message: "Nhập ngày hết hạn",
              },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button className="!bg-[#1677ff] text-white" htmlType="submit">
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {userExtention ? (
        <ModalExtention
          open={userExtention}
          onClose={() => setUserExtention(false)}
          onConfirm={handleUpdateExtention}
        />
      ) : null}

      {userResetPassWord ? (
        <ModalResetPassword
          open={userResetPassWord}
          onClose={() => setUserResetPassWord(false)}
          onConfirm={handleUpdatePassword}
        />
      ) : null}
    </div>
  );
};

export default Dashboard;
