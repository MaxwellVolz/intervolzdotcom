import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import Navbar from './Navbar';
import BottomBar from './BottomBar';
import LeftPanel from './LeftPanel';
import MainPanel from './MainPanel';
import Console from './Console';

export default function DesktopLayout() {
    return (
        <div className="flex container-div flex-col h-full">
            {/* Navbar */}
            <div className="h-11 shrink-0 bg-gray-800 text-white">
                <Navbar />
            </div>

            {/* Main Panel Layout */}
            <div className="flex-1 container-div min-h-0">
                <PanelGroup direction="horizontal" className="h-full">
                    <Panel defaultSize={15} minSize={5} className="overflow-auto">
                        <LeftPanel />
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-gray-700 cursor-col-resize" />
                    <Panel minSize={20} className="flex flex-col">
                        <PanelGroup direction="vertical" className="h-full">
                            <Panel defaultSize={85} minSize={30} className="bg-gray-800 text-white overflow-auto">
                                <MainPanel />
                            </Panel>
                            <PanelResizeHandle className="h-2 cursor-row-resize" />
                            <Panel minSize={10} className="bg-red-950 text-white overflow-auto">
                                <Console />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </div>

            {/* Bottom Bar */}
            <div className="h-8 shrink-0 bg-gray-800 text-white">
                <BottomBar />
            </div>
        </div>
    );
}
