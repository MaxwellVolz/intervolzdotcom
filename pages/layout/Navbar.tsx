import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="px-4 py-2 border-b border-gray-700 text-vscode-text border-vscode-border bg-vscode-bg">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={30} minSize={20} className="flex items-center justify-start group relative text-gray-400">
          <Link href="/dank2" className="relative inline-block no-underline text-inherit h-full">
            <span className="block transition-transform duration-300 group-hover:-translate-y-full">
              File
            </span>
            <span className="absolute top-full left-0 block transition-transform duration-300 group-hover:translate-y-[-100%]">
              Home
            </span>
          </Link>
        </Panel>
        <PanelResizeHandle className="w-2 cursor-col-resize" />
        <Panel minSize={20} className="flex border border-gray-700 bg-gray-900 items-center text-vscode-text border-vscode-border bg-vscode-bg justify-center rounded-md">
          /InterVolz
        </Panel>
        <PanelResizeHandle className="w-2 cursor-col-resize" />
        <Panel defaultSize={30} minSize={20} className="flex items-center justify-end text-gray-400">
          <FaGithub className="w-5 h-5 text-gray-400 hover:text-white mr-4" />
          <FaLinkedin className="w-5 h-5 text-blue-500 hover:text-white" />
        </Panel>
      </PanelGroup>
    </div>
  );
}
