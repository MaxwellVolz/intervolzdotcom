import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { SiUnity, SiN8N } from 'react-icons/si';
import Link from 'next/link';


const currentProjects = [
    {
        id: 'item-1',
        title: 'Automation',
        content: 'This is parent content',
        children: [
            {
                id: 'child-1',
                title: 'n8n - BrainRot Generator',
                content: 'Nested content 1',
            },
            {
                id: 'child-2',
                title: 'n8n - Trending News',
                content: 'Nested content 2',
            },
        ],
    },
    {
        id: 'item-2',
        title: 'Game Development',
        content: 'Localz',
        children: [
            {
                id: 'child-1',
                title: 'Unity - Localz',
                content: 'Nested content 1',
            },
            {
                id: 'child-2',
                title: 'Blender - North Beach',
                content: 'Nested content 2',
            },
        ],
    },
]

const articles = [
    {
        id: 'item-1',
        title: 'July',
        content: 'This is parent content',
        children: [
            {
                id: 'child-1',
                title: 'Child 1',
                content: 'Nested content 1',
            },
            {
                id: 'child-2',
                title: 'Child 2',
                content: 'Nested content 2',
            },
        ],
    },
    {
        id: 'item-2',
        title: 'June',
        content: 'This is another top-level item',
        children: [],
    },
];


export default function LeftPanel() {
    return (
        <div className="hundo-height text-white border-r border-gray-700 height-100">
            <PanelGroup direction="vertical">
                <PanelGroup direction="vertical">
                    <Panel maxSize={80}>
                        <div className="text-gray-300">
                            <ChevronDown className="inline-flex w-4 h-4 mx-1 transition-transform group-data-[state=open]:rotate-180" />
                            Current Projects
                        </div>
                        <Accordion.Root type="multiple" className="w-full relative" defaultValue={['automation-accordion', 'gamedev-accordion']}>
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-black to-transparent pointer-events-none" />
                            <div className="flex gap-4 text-white">
                            </div>
                            <Accordion.Item key="automation-accordion" value="automation-accordion">
                                <Accordion.Header>
                                    <Accordion.Trigger
                                        className="group w-full px-2 py-2 text-left bg-vscode-bg flex items-center">
                                        <ChevronRight className="w-4 h-4 transition-transform group-data-[state=open]:rotate-90 mr-1" />
                                        <span>Automation</span>
                                    </Accordion.Trigger>
                                </Accordion.Header>
                                <Accordion.Content className="text-sm text-gray-300 space-y-2">
                                    <Link href="/" className="no-underline text-inherit h-full">
                                        <p className="hover:bg-gray-700 text-[#EF6C00] py-2"><SiN8N className="w-6 h-6 text-[#EF6C00] mr-2 ml-6 inline" title="n8n" />ViralN8tion</p>
                                    </Link>
                                    <Link href="/" className="no-underline text-inherit h-full">
                                        <p className="hover:bg-gray-700 text-[#EF6C00] py-2"><SiN8N className="w-6 h-6 mr-2 ml-6 inline" title="n8n" />Trend Watch</p>
                                    </Link>
                                </Accordion.Content>
                            </Accordion.Item>
                            <Accordion.Item key="gamedev-accordion" value="gamedev-accordion">
                                <Accordion.Header>
                                    <Accordion.Trigger
                                        className="group w-full px-2 py-2 text-left bg-gray-800 flex items-center">
                                        <ChevronRight className="w-4 h-4 transition-transform group-data-[state=open]:rotate-90 mr-1" />
                                        <span>Game Dev</span>
                                    </Accordion.Trigger>
                                </Accordion.Header>
                                <Accordion.Content className="text-sm text-gray-300 space-y-2">
                                    <Link href="/" className="no-underline text-inherit h-full">
                                        <p className="hover:bg-gray-700  py-2"><SiUnity className="w-6 h-6 text-gray-400 mr-2 ml-6 inline" title="Unity" />Localz</p>
                                    </Link>
                                </Accordion.Content>
                            </Accordion.Item>
                        </Accordion.Root>
                    </Panel>
                    <PanelResizeHandle />
                    <Panel maxSize={85} className="border-t border-gray-700">

                        <Accordion.Root type="multiple" className="w-full">
                            {articles.map((item) => (
                                <Accordion.Item key={item.id} value={item.id} className="border-b border-gray-700">
                                    <Accordion.Header>
                                        <Accordion.Trigger
                                            className="group w-full px-4 py-2 text-left bg-gray-800 hover:bg-gray-700 flex items-center justify-between"
                                        >
                                            <span>{item.title}</span>
                                            <ChevronRight className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />

                                        </Accordion.Trigger>
                                    </Accordion.Header>
                                    <Accordion.Content className="bg-gray-900 text-sm text-gray-300 px-4 py-2 space-y-2">
                                        <p>{item.content}</p>

                                        {/* Nested accordion if children exist */}
                                        {item.children?.length > 0 && (
                                            <Accordion.Root type="multiple" className="ml-4 border-l border-gray-700 pl-4">
                                                {item.children.map((child) => (
                                                    <Accordion.Item key={child.id} value={child.id} className="border-b border-gray-700">
                                                        <Accordion.Header>
                                                            <Accordion.Trigger
                                                                className="group w-full px-2 py-1 text-left bg-gray-800 hover:bg-gray-700 flex items-center justify-between text-sm"
                                                            >
                                                                <span>{child.title}</span>
                                                                <ChevronRight className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                                                            </Accordion.Trigger>
                                                        </Accordion.Header>
                                                        <Accordion.Content className="bg-gray-900 px-2 py-1 text-xs text-gray-400">
                                                            {child.content}
                                                        </Accordion.Content>
                                                    </Accordion.Item>
                                                ))}
                                            </Accordion.Root>
                                        )}
                                    </Accordion.Content>
                                </Accordion.Item>
                            ))}
                        </Accordion.Root>

                    </Panel>
                </PanelGroup>
            </PanelGroup>
        </div>
    );
}
