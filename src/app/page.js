"use client"
import { createClient } from '@supabase/supabase-js';
import { Button, Card, Input, Modal, Table, notification } from 'antd';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [dataPhone, setDataPhone] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  const supabase = createClient(
    "https://qsucitblvnvexhprzzqa.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdWNpdGJsdm52ZXhocHJ6enFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkwNTY1MjUsImV4cCI6MTk5NDYzMjUyNX0.pzFYFIcnIbkU_dpGFUqD8ypd_yCIyKWS5pUgTI2WYn0"
  );
  useEffect(() => {
    checkSession();
    init()
  }, [])
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      return router.push("/");
    }
    router.push("/login");
  };
  const init = async () => {
    const { data } = await supabase
      .from('key')
      .select('*')
      .order('id', { ascending: true })
    setDataPhone(data);
  }
  const logout = async () => {
    await supabase.auth.signOut()
  }
  const lock = async (phone, status) => {
    await supabase.from('key').update({ is_active: status }).eq('phone', phone)
    api["success"]({
      message: 'Thành công',
      description:
        `Thay đổi trạng thái số điện thoại ${phone} thành công`,
    });
    init()
  }
  const deleteAccount = async (phone) => {
    await supabase.from('key').delete().eq('phone', phone)
    api["success"]({
      message: 'Thành công',
      description:
        `Xóa số điện thoại ${phone} thành công`,
    });
    init()
  }
  const createNewKey = async () => {
    await supabase.from('key').upsert({ phone: phone, is_active: true })
    setPhone("")
    init()
    setIsModalOpen(false);
    api["success"]({
      message: 'Thành công',
      description:
        'Thêm mới số điện thoại thành công',
    });
  }
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    createNewKey()

  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setPhone("")
  };
  const columns = [
    {
      title: 'Số thứ tự',
      dataIndex: 'id',
      key: 'id',
      width: 100,

    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 300,
      key: 'is_active',
      render: (_, record) => {
        return (
          <p>{record.is_active ? "Đang hoạt động" : "Đã khóa"}</p>
        )
      }
    },
    {
      title: 'Thay đổi trạng thái',
      key: 'action',
      width: 300,
      render: (_, record) => (
        <div>
          <Button type="primary" style={{ background: "red" }} onClick={() => {
            lock(record.phone, false)
          }}>Khóa</Button>
          <Button type="primary" style={{ background: "green", marginLeft: "10px" }} onClick={() => {
            lock(record.phone, true)
          }}>Mở khóa</Button>
          <Button type="primary" style={{ background: "black", color: "white", marginLeft: "10px" }} onClick={() => {
            deleteAccount(record.phone)
          }}>Xóa</Button>
        </div>
      ),
    },
  ];
  return (
    <div style={{ width: "100wh", height: "100vh", display: "flex", justifyContent: "center", flexDirection: "column" }}>
      {contextHolder}
      <div style={{ width: "100%", display: "flex", justifyContent: "end", padding: "20px" }}>
        <Button type="primary" onClick={showModal}>
          Tạo số điện thoại mới
        </Button>
        <Button type="primary" onClick={logout} style={{ marginLeft: "10px" }}>Đăng xuất</Button>
      </div>
      <div style={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Card
          style={{
            width: "80%",
          }}
        >
          <Table columns={columns} dataSource={dataPhone} />
        </Card>
      </div>
      <Modal title="Thêm số mới" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Input value={phone} placeholder="Nhập số điện thoại" onChange={(e) => {
          setPhone(e.target.value)
        }} />
      </Modal>
    </div>
  );
}

export default Dashboard;