import { useNavigate } from "react-router-dom";
import TabImportView from "@/views/TabImportView";

const ImportPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <TabImportView onBack={handleBack} />;
};

export default ImportPage;
