"use client";
import { createClient } from "@supabase/supabase-js";
import { Button, Card, Input, Modal, Table, notification, Form, DatePicker } from "antd";
import moment from 'moment';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataUser, setDataUser] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();


  
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
      render: (_, record) => {
        return <p>{moment(record.created_at).format("DD-MM-YYYY")}</p>;
      },
    },
    {
      title: "Ngày hết hạn",
      key: "expire_at",
      dataIndex: "expire_at",
      render: (_, record) => {
        return <p>{moment(record.expire_at).format("DD-MM-YYYY")}</p>;
      },
    },
    {
      title: "Trạng thái",
      key: "active",
      dataIndex: "active",
      render: (_, record) => {
        return <p>{moment().isAfter(record.expire_at)?"Hết hạn":record.active ? "Hoạt động" : "Khóa"}</p>;
      },
    },
    {
      title: "Thay đổi trạng thái",
      key: "action",
      width: 400,
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            style={{ background: "red" }}
            onClick={() => {
              lockByUser(record.username, false);
            }}>
            Khóa
          </Button>
          <Button
            type="primary"
            style={{ background: "green", marginLeft: "10px" }}
            onClick={() => {
              lockByUser(record.username, true);
            }}>
            Mở khóa
          </Button>
          <Button
            type="primary"
            style={{ background: "black", color: "white", marginLeft: "10px" }}
            onClick={() => {
              deleteAccountByUser(record.username);
            }}>
            Xóa
          </Button>

        </div>
      ),
    },
  ];
  const onFinish = async (values) => {
    try {
      await supabase.from("user").upsert(values);
      form.resetFields();
      setIsModalOpen(false)
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
  return (
    <div
      style={{
        width: "100wh",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "scroll"
      }}>
      {contextHolder}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "end",
          padding: "20px",
        }}>
        <Button type="primary" onClick={showModal}>
          Thêm khách hàng mới
        </Button>
        <Button type="primary" onClick={logout} style={{ marginLeft: "10px" }}>
          Đăng xuất
        </Button>
      </div>
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Card
          style={{
            width: "80%",
          }}>
          <Table
            columns={columns}
            dataSource={dataUser}
          />
        </Card>
      </div>
      <Modal
        title="Thêm khách hàng mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={<></>}
        style={{ display: "flex", flexDirection: "column" }}>
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
                message: 'Nhập tài khoản',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="expire_at" label="Ngày hết hạn" rules={[
            {
              required: true,
              message: 'Nhập ngày hết hạn',
            },
          ]}>
            <DatePicker />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default Dashboard;
