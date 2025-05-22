"use client";

import { ConfigSection } from "./components/ConfigSection";
import { ChatInterface } from "./components/ChatInterface";

export default function Home() {
	return (
		<div className="flex flex-col h-screen">
			<main className="flex h-screen bg-gray-50">
				<div className="w-[300px] border-r border-gray-200 bg-white flex flex-col">
					<ConfigSection />
				</div>

				<div className="flex-1 flex flex-col">
					<div className="bg-white border-b border-payman-neutral/30">
						<div className="py-2">
							<div className="text-center flex mr-6">
								<h1 className="text-5xl font-bold text-gray-900 tracking-tight flex-1">
									PAYGENT
									<span className="text-payman-primary relative">
										.
										<span className="relative inline-block px-[2px]">
											0
											<span className="absolute inset-0 flex items-center justify-center overflow-visible">
												<span className="h-[4px] w-[100%] bg-payman-primary rotate-[-70deg] block absolute transform -translate-y-[1px]" />
											</span>
										</span>
										1
									</span>
								</h1>
							</div>
						</div>
					</div>

					<div className="flex-1 flex overflow-hidden">
						<ChatInterface />
					</div>
				</div>
			</main>
		</div>
	);
}
