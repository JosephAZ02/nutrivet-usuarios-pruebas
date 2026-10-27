
import type { ReportTabItem, ReportType } from "../../interfaces/Report";



interface ReportTabProps {
    tabs: ReportTabItem[],
    activeId: ReportType,
    onChange: (id: ReportType) => void
}

function ReportTab({ tabs, activeId, onChange }: ReportTabProps) {

    return (
        <div className="tabs-container">
            <div className="tabs-header">
                {tabs.map((tab) => (
                    <button
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
