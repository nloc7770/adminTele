import AuthUI from "./Auth";
export default function Register() {
    return (
        <div style={{ width: "100wh", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "30%", height: "50%" }}>
                <AuthUI
                />
            </div>
        </div>
    );
}