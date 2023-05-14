"use client";
import { createClient } from "@supabase/supabase-js";
import { Button, Card, Modal, Skeleton, Table, notification } from "antd";
import moment from "moment";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [dataPhone, setDataPhone] = useState([]);
  const [dataPhoneAdd, setDataPhoneAdd] = useState([]);
  const [api, contextHolder] = notification.useNotification();

  const supabase = createClient(
    "https://qsucitblvnvexhprzzqa.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdWNpdGJsdm52ZXhocHJ6enFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkwNTY1MjUsImV4cCI6MTk5NDYzMjUyNX0.pzFYFIcnIbkU_dpGFUqD8ypd_yCIyKWS5pUgTI2WYn0"
  );
  useEffect(() => {
    checkAuth();
  }, []);
  const checkAuth = async () => {

    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      }
      let email = data?.session?.user?.email;
      setEmail(email);
      const { data: dataCheck } = await supabase
        .from("user")
        .select("*")
        .eq("username", email);

      if (dataCheck.length == 0) {
        setLoading(false)
        return setIsAuth(false);
      }
      if (dataCheck) {
        setIsAuth(true);
      }
      if (!dataCheck[0].active) {
        setIsAuth(false);
      }
      if (moment().isAfter(dataCheck[0].expire_at)) {
        setIsAuth(false);
      }
      const { data: dataPhone } = await supabase
        .from('key')
        .select('*')
        .eq('user', email)
      setDataPhone(dataPhone);
      setLoading(false)
    } catch (error) {
      api["error"]({
        message: "Lỗi",
        description: error,
      });
      setLoading(false)

    }
  };
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  const deleteAccount = async (phone) => {
    await supabase.from("key").delete().eq("phone", phone);
    api["success"]({
      message: "Thành công",
      description: `Xóa số điện thoại ${phone} thành công`,
    });
    checkAuth()
  };
  const handleOnChange = (e) => {
    try {
      const file = e.target?.files?.[0];
      // If user clicks the parse button without
      // a file we show a error

      // Initialize a reader which allows user
      // to read any file or blob.
      const reader = new FileReader();

      // Event listener on reader when the file
      // loads, we parse it and set the data.
      reader.onload = async ({ target }) => {
        const csv = Papa.parse(target.result, { header: true });
        const parsedData = csv?.data;
        let newArr = [];
        for (let index = 0; index < parsedData.length; index++) {
          const element = parsedData[index];
          if (element.phone)
            newArr.push({
              key: `${element.phone}${email}`,
              user: email,
              phone: element.phone,
              is_active: true,
            });
        }
        setDataPhoneAdd(newArr);
      };
      reader.readAsText(file);
    } catch (error) { }
  };

  const createNewKey = async () => {
    await supabase.from("key").upsert(dataPhoneAdd);
    checkAuth();
    setIsModalOpen(false);
    setDataPhoneAdd([])
    api["success"]({
      message: "Thành công",
      description: "Thêm mới số điện thoại thành công",
    });
  };
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    createNewKey();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const columns = [
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Thay đổi trạng thái",
      key: "action",
      width: 200,
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            style={{ background: "black", color: "white", marginLeft: "10px" }}
            onClick={() => {
              deleteAccount(record.phone);
            }}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];
  const columnsAdd = [
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Xóa",
      key: "action",
      width: 100,
      render: (_, record) => (
        <div>
          <Button
            type="primary"
            style={{ background: "black", color: "white", marginLeft: "10px" }}
            onClick={() => {
              let newPhoneArr = dataPhoneAdd.filter(function (item) {
                return item.phone !== record.phone
              })
              setDataPhoneAdd(newPhoneArr)
            }}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];
  console.log(isAuth);
  return (
    <div
      style={{
        width: "100wh",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        backgroundColor: "lightsteelblue"
      }}>
      {contextHolder}
      {loading ?
        <Skeleton active /> : <>
          {isAuth ? (
            <>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "end",
                  padding: "20px",
                }}>
                <Button type="primary" onClick={showModal}>
                  Tạo số điện thoại mới
                </Button>
                <Button
                  type="primary"
                  onClick={logout}
                  style={{ marginLeft: "10px" }}>
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
                  <Table columns={columns} dataSource={dataPhone} />
                </Card>
              </div>
              <Modal
                title="Thêm số mới"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}>
                <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-between" }}>
                  <label
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: "green",
                      display: "block",
                      cursor: "pointer",
                      color: "white",
                      width: "fit-content",

                    }}>
                    <input
                      onChange={handleOnChange}
                      id="csvInput"
                      name="file"
                      type="File"
                      accept={".csv"}
                      style={{ display: "none" }}
                    />
                    Lấy danh sách số điện thoại
                  </label>
                  <a
                    href='https://res.cloudinary.com/dfs1kb2dk/raw/upload/v1684048056/telegram_xcel/templet_admin_add_user_j819n7_vcoljg.csv'
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: "Highlight",
                      display: "block",
                      cursor: "pointer",
                      color: "white",
                      width: "fit-content",
                    }}>
                    Lấy file mẫu
                  </a>
                  <a
                    onClick={() => {
                      setDataPhoneAdd([])
                    }}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: "black",
                      display: "block",
                      cursor: "pointer",
                      color: "white",
                      width: "fit-content",

                    }}>
                    Xóa danh sách
                  </a>
                </div>
                <Table columns={columnsAdd} dataSource={dataPhoneAdd} size="small" style={{ marginTop: 15 }} />

              </Modal>
            </>
          ) : (
            <>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "end",
                  padding: "20px",
                }}>
                <Button
                  type="primary"
                  onClick={logout}
                  style={{ marginLeft: "10px" }}>
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
                  fontSize: 40,
                  fontWeight: 800
                }}>
                Tài khoản đã hết hạn hoặc bị khóa
              </div>
            </>
          )}
        </>}
    </div>
  );
};

export default Dashboard;
