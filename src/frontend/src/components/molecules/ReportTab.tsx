
import type { ReportTabItem, ReportType } from "../../interfaces/Report";
import "./ReportTab.css";

interface ReportTabProps {
    tabs: ReportTabItem[],
    activeId: ReportType,
    onChange: (id: ReportType) => void
}

function ReportTab({ tabs, activeId, onChange }: ReportTabProps) {

    return (
        <div className="tabs-container" >
            <div className="tabs-header">
                {tabs.map((tab) => (
                    <button
                        style={{ fontSize: "14px", padding: "0.5rem 1rem", border: "none", backgroundColor: "transparent", cursor: "pointer" }}
                        type="button"
                        className={
                            "tab-button " +
                            (tab.id === activeId ? "tab-active" : "")
                        }
                        key={tab.label}
                        onClick={() => onChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

        </div>
    );
}

export default ReportTab;
