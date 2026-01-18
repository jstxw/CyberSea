'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';

const CubeViewer = dynamic(() => import('@/components/CubeViewer'), { ssr: false });

export default function Home() {
  const [showMobileModal, setShowMobileModal] = useState(false);

  const handleLaunchDemoClick = (
    e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    if (typeof window === 'undefined') return;
    // Only intercept navigation on smaller screens
    if (window.innerWidth < 1024) {
      e?.preventDefault();
      setShowMobileModal(true);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const fadeInDown = {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#E5E6DA] font-mono flex flex-col">
      {/* Global Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      {/* Hero Section with Blue Gradient */}
      <div className="relative z-10" style={{
        backgroundImage: 'linear-gradient(to bottom, #3a6ea5 0%, #2a5080 30%, #1a3a5c 60%, #0a1a2e 100%)',
        backgroundColor: '#3a6ea5'
      }}>
        {/* Navigation Header */}
        <nav className="px-0 h-16 flex justify-between items-center relative z-20">
        <div className="flex items-center h-full flex-1">
          {/* Nav Items */}
          <div className="hidden md:flex h-full items-center px-6 gap-8 text-sm font-medium uppercase tracking-wide flex-1">
            {[
              { name: 'Protocol', href: '#process' },
              { name: 'Intelligence', href: '#metrics' },
              { name: 'Systems', href: '#integrations' },
              { name: 'Simulator', href: '#mesh-viewer' },
              { name: 'Operations', href: '#visualize' }
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-8 group">
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector(item.href);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="hover:text-[#3B82F6] transition-colors cursor-pointer"
                >
                  {item.name}
                </a>
                <span className="text-[#E5E6DA]/20 group-last:hidden">/</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 px-6">
          <Link
            href="/dashboard"
            className="px-5 py-1.5 bg-transparent corner-brackets text-[#E5E6DA] text-[12px] uppercase font-bold hover:bg-white/20 transition-colors duration-300"
            onClick={handleLaunchDemoClick}
          >
            Access Platform
          </Link>
        </div>
      </nav>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-12">

        {/* Left Sidebar (Empty/Decor) */}
        <div className="hidden lg:block col-span-1 relative overflow-hidden">
        </div>

        {/* Left Visualization Column */}
        <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="w-full h-full flex items-center justify-center"
          >
          </motion.div>
        </div>

        {/* Main Hero Content */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">

          {/* Hero Section */}
          <motion.div
            className="px-4 lg:px-4 flex flex-col justify-center items-end text-right gap-4 lg:gap-6 flex-1"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >

            <motion.h2
              className="text-3xl lg:text-5xl mt-24 mr-36 font-latos font-medium leading-none tracking-tight text-[#E5E6DA]"
              variants={staggerItem}
            >
              Military Design Lab
            </motion.h2>

            <motion.p
              className="text-xs lg:text-sm font-latos mr-36 opacity-70 max-w-lg lg:max-w-xl leading-relaxed"
              variants={staggerItem}
            >
              Accelerate combat readiness with real-time 3D wireframe analysis of military equipment. Our platform combines advanced geometric processing with AI-powered component recognition to train personnel on identifying enemy vehicles, aircraft, and weapon systems. Master threat assessment through interactive visualization — built for speed, accuracy, and mission success.
            </motion.p>

            {/* Mobile 3D Visualization Box */}
            <motion.div
              className="lg:hidden h-64 border border-[#E5E6DA] relative overflow-hidden shrink-0 my-4"
              variants={staggerItem}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <CubeViewer />
              </div>
              {/* Overlay UI Elements */}
              <div className="absolute top-4 left-4 text-[10px] uppercase opacity-50">Rendering...</div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-2 mb-40"
              variants={staggerItem}
            >

              <div className="corner-arrows-wrapper w-full sm:w-auto mb-2 sm:mb-0">
                <Link
                  href="/dashboard"
                  className="corner-arrows-button w-full sm:w-auto px-10 mr-36 py-3 bg-transparent text-[#E5E6DA] text-[12px] uppercase font-bold hover:text-white transition-colors text-center sm:text-left block"
                  onClick={handleLaunchDemoClick}
                >
                  <span className="corner-arrows-top-right"></span>
                  <span className="corner-arrows-bottom-left"></span>
                  <span className="relative z-10">Access Training Platform</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </main>

        {/* Wave Divider */}
        <div className="relative w-full overflow-hidden" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
            <path d="M0,0 C150,60 350,0 600,40 C850,80 1050,20 1200,60 L1200,120 L0,120 Z" fill="#0a0a0a" />
          </svg>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="process" className="relative z-10">
        <div className="grid grid-cols-12">
          {/* Left Sidebar Spacer */}
          <div className="hidden lg:block col-span-1"></div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-11">
            <motion.div
              className="px-10 py-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >


              <motion.h3
                className="text-4xl font-sans font-medium leading-none tracking-tight text-[#E5E6DA] mb-12"
                variants={fadeInUp}
              >
                Operational Workflow
              </motion.h3>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0"
                variants={staggerContainer}
              >
                {[
                  {
                    step: '01',
                    title: 'Deploy',
                    description: 'Upload wireframe models of military equipment or access our classified database of foreign and domestic assets. Support for all standard defense modeling formats.',
                  },
                  {
                    step: '02',
                    title: 'Scan',
                    description: 'AI-powered threat recognition engine analyzes mesh geometry and identifies tactical components — weapons systems, armor plating, sensor arrays, and vulnerabilities.',
                  },
                  {
                    step: '03',
                    title: 'Identify',
                    description: 'Real-time component breakdown with intelligence-grade annotations. Understand threat capabilities, weak points, and operational characteristics at a glance.',
                  },
                  {
                    step: '04',
                    title: 'Assess',
                    description: 'Generate tactical reports and export intelligence briefs. Document findings, share across units, and integrate with mission planning systems.',
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className={`p-8 hover:bg-[#E5E6DA] hover:text-[#0a0a0a] transition-colors group`}
                    variants={staggerItem}
                  >
                    <div className="text-[10px] uppercase opacity-50 mb-4 font-mono">{item.step}</div>
                    <h4 className="text-xl font-medium mb-3">{item.title}</h4>
                    <p className="text-sm opacity-70 leading-relaxed">{item.description}</p>
                    {idx < 3 && (
                      <div className="mt-6 flex items-center gap-2 opacity-20 group-hover:opacity-40">
                        <div className="w-full h-px bg-[#1D1E15]"></div>
                        <div className="w-1.5 h-1.5 bg-[#3B82F6]"></div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="metrics" className="relative z-10">
        <div className="grid grid-cols-12">
          {/* Left Sidebar Spacer */}
          <div className="hidden lg:block col-span-1"></div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-11">
            <motion.div
              className="px-10 py-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-2 py-0.5 border border-[#E5E6DA] text-[10px] uppercase tracking-wider w-fit mb-8"
                variants={fadeInDown}
              >
                <div className="w-1.5 h-1.5 bg-[#3B82F6]"></div>
                INTELLIGENCE
              </motion.div>

              <motion.h3
                className="text-4xl font-sans font-medium leading-none tracking-tight text-[#E5E6DA] mb-12"
                variants={fadeInUp}
              >
                Mission Performance Metrics
              </motion.h3>

              {/* Combined Bar Graph - Sketchfab Import vs SAM3D META Model */}
              <motion.div
                className="border border-[#E5E6DA] mb-8 overflow-hidden"
                variants={fadeInUp}
              >
                <div className="p-8">
                  {/* Explanation Section */}
                  <div className="mb-8 pb-6 border-b border-[#E5E6DA]">
                    <div className="text-[10px] uppercase opacity-50 mb-4">Training Analysis Methods</div>
                    <div className="space-y-4 text-sm opacity-70 leading-relaxed">
                      <p>
                        <span className="font-bold text-[#E5E6DA]">AI-Assisted Analysis</span> leverages our custom-trained threat recognition model powered by SAM3D architecture. The system performs automated component extraction and tactical assessment directly from 3D wireframes, identifying weapons systems, vulnerabilities, and critical components in seconds.
                      </p>
                      <p>
                        <span className="font-bold text-[#E5E6DA]">Manual Analysis</span> refers to traditional training methods where personnel manually inspect wireframes and documentation to identify components — the baseline approach used in conventional military training programs.
                      </p>
                      <p className="text-xs opacity-60 italic">
                        The chart below compares average identification times across different equipment complexities. Our AI-assisted platform reduces analysis time by 60-70%, enabling rapid threat assessment in time-critical scenarios. While both methods achieve high accuracy, AI assistance dramatically accelerates the learning curve for trainees and provides consistent, reliable component identification across all equipment types.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-[10px] uppercase opacity-50 mb-2">Threat Identification Speed: Manual vs AI-Assisted</div>
                    <p className="text-xs opacity-60 italic">
                      This chart shows the average time to identify and analyze military equipment components across different complexities. Lower times indicate faster threat assessment capability.
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Y-Axis */}
                    <div className="flex flex-row md:flex-col justify-between md:h-80 text-[8px] uppercase opacity-40 pt-1 pb-2 md:pb-8 md:pr-2 gap-2 md:gap-0">
                      <span>5.0s</span>
                      <span>4.0s</span>
                      <span>3.0s</span>
                      <span>2.0s</span>
                      <span>1.0s</span>
                      <span>0s</span>
                    </div>

                    {/* Chart Bars */}
                    <div className="flex-1 h-80 flex flex-wrap md:flex-nowrap items-end gap-4 relative">
                      {[
                        { label: 'Light Vehicles (Jeeps, Light Armor)', sketchfab: 1.3, meta: 2.2 },
                        { label: 'Medium Assets (IFVs, Helicopters)', sketchfab: 2.0, meta: 2.9 },
                        { label: 'Heavy Equipment (Tanks, Aircraft)', sketchfab: 3.5, meta: 3.3 },
                        { label: 'Complex Systems (Naval Vessels)', sketchfab: 4.4, meta: 3.8 },
                      ].map((item, idx) => {
                        const maxTime = 5.0; // Maximum time on y-axis
                        const chartHeight = 320; // h-80 = 320px
                        const sketchfabHeight = (item.sketchfab / maxTime) * chartHeight;
                        const metaHeight = (item.meta / maxTime) * chartHeight;

                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center justify-end gap-2 h-full relative"
                          >
                            <div className="flex items-end gap-2 w-full justify-center relative" style={{ height: '320px' }}>
                              {/* Sketchfab Import Bar */}
                              <div className="flex flex-col items-center justify-end relative" style={{ height: '320px' }}>
                                {/* Logo above bar */}
                                <div
                                  className="absolute flex items-center justify-center"
                                  style={{
                                    bottom: `${sketchfabHeight + 12}px`,
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  <img
                                    src="/sketch.png"
                                    alt="Sketchfab"
                                    className="w-8 h-8 object-contain filter brightness-0 opacity-60"
                                  />
                                </div>
                                <div
                                  className="bg-[#1D1E15] hover:bg-[#E5E6DA]/80 transition-colors relative"
                                  style={{
                                    height: `${sketchfabHeight}px`,
                                    width: 'calc(45% - 4px)',
                                    minWidth: '40px'
                                  }}
                                />
                              </div>
                              {/* SAM3D META Model Bar */}
                              <div className="flex flex-col items-center justify-end relative" style={{ height: '320px' }}>
                                {/* Logo above bar */}
                                <div
                                  className="absolute flex items-center justify-center"
                                  style={{
                                    bottom: `${metaHeight + 12}px`,
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                  }}
                                >
                                  <img
                                    src="/meta-logo.png"
                                    alt="Meta"
                                    className="w-8 h-8 object-contain opacity-60"
                                  />
                                </div>
                                <div
                                  className="bg-[#3B82F6] hover:bg-[#3B82F6]/80 transition-colors relative"
                                  style={{
                                    height: `${metaHeight}px`,
                                    width: 'calc(45% - 4px)',
                                    minWidth: '40px'
                                  }}
                                />
                              </div>
                            </div>
                            <div className="text-[8px] uppercase opacity-40 mt-2 text-center px-1">{item.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#E5E6DA]">
                    <div className="flex items-center justify-center gap-8 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#1D1E15]"></div>
                        <div className="text-[10px] uppercase opacity-70">Manual Analysis</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#3B82F6]"></div>
                        <div className="text-[10px] uppercase opacity-70">AI-Assisted Analysis</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold mb-1">3.2min</div>
                        <div className="text-[10px] uppercase opacity-50">Avg Manual</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold mb-1">1.1min</div>
                        <div className="text-[10px] uppercase opacity-50">Avg AI-Assisted</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="relative z-10">
        <div className="grid grid-cols-12">
          {/* Left Sidebar Spacer */}
          <div className="hidden lg:block col-span-1"></div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-11">
            <motion.div
              className="px-10 py-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-2 py-0.5 border border-[#E5E6DA] text-[10px] uppercase tracking-wider w-fit mb-8"
                variants={fadeInDown}
              >
                <div className="w-1.5 h-1.5 bg-[#3B82F6]"></div>
                SYSTEMS
              </motion.div>

              <motion.h3
                className="text-4xl font-sans font-medium leading-none tracking-tight text-[#E5E6DA] mb-12"
                variants={fadeInUp}
              >
                AI Intelligence Engine
              </motion.h3>

              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-[#E5E6DA]"
                variants={staggerContainer}
              >
                {/* Gemini Pro */}
                <motion.div
                  className="p-8 border-r border-b border-[#E5E6DA] lg:border-b-0 hover:bg-[#E5E6DA] hover:text-[#0a0a0a] transition-colors flex flex-col h-full"
                  variants={staggerItem}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src="/gemini-pro.png" alt="Gemini Pro" className="h-8 w-auto object-contain filter brightness-0 opacity-60" />
                  </div>
                  <p className="text-sm opacity-70 leading-relaxed mb-6 flex-1">
                    Integrated AI vision system for real-time military equipment identification. When trainees highlight wireframe components, our intelligence engine analyzes mesh geometry and visual data, providing structured tactical assessments with component names, threat classifications, vulnerability ratings, and confidence scores. Generates annotated tactical overlays with labeled components for operational briefings.
                  </p>
                  <div className="pt-4 border-t border-[#E5E6DA] grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase opacity-50 mb-1">Use Case</div>
                      <div className="text-sm font-medium">Threat Identification & Tactical Assessment</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase opacity-50 mb-1">Model</div>
                      <div className="text-sm font-medium">gemini-2.0-flash-exp</div>
                    </div>
                  </div>
                </motion.div>

                {/* OpenAI */}
                <motion.div
                  className="p-8 hover:bg-[#E5E6DA] hover:text-[#0a0a0a] transition-colors flex flex-col h-full"
                  variants={staggerItem}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img src="/openai.png" alt="OpenAI" className="h-8 w-auto object-contain filter brightness-0 opacity-60" />
                  </div>
                  <p className="text-sm opacity-70 leading-relaxed mb-6 flex-1">
                    Processes identified components to generate detailed tactical intelligence reports on military equipment. After component recognition, our analysis engine evaluates mesh geometry, positioning, and tactical context to provide comprehensive threat assessments, capability analysis, and operational intelligence on each component's role in the weapons system.
                  </p>
                  <div className="pt-4 border-t border-[#E5E6DA] grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase opacity-50 mb-1">Use Case</div>
                      <div className="text-sm font-medium">Tactical Intelligence Reports</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase opacity-50 mb-1">Model</div>
                      <div className="text-sm font-medium">GPT-4</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upload & Export Section */}
      <section id="upload-export" className="relative z-10">
        <div className="grid grid-cols-12">
          {/* Left Sidebar Spacer */}
          <div className="hidden lg:block col-span-1"></div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-11">
            <motion.div
              className="px-10 py-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-2 py-0.5 border border-[#E5E6DA] text-[10px] uppercase tracking-wider w-fit mb-8"
                variants={fadeInDown}
              >
                <div className="w-1.5 h-1.5 bg-[#3B82F6]"></div>
                OPERATIONS
              </motion.div>

              <motion.h3
                className="text-4xl font-sans font-medium leading-none tracking-tight text-[#E5E6DA] mb-12"
                variants={fadeInUp}
              >
                Asset Management
              </motion.h3>

              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-[#E5E6DA]"
                variants={staggerContainer}
              >
                {/* Upload */}
                <motion.div
                  className="p-8 border-r border-b border-[#E5E6DA] lg:border-b-0 hover:bg-[#E5E6DA] hover:text-[#0a0a0a] transition-colors flex flex-col h-full"
                  variants={staggerItem}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 border-2 border-[#E5E6DA] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm opacity-70 leading-relaxed mb-6 flex-1">
                    Upload classified wireframe models of foreign military equipment for threat analysis and training scenarios. Our intelligence platform automatically identifies tactical components, weapons systems, and structural vulnerabilities. Supports equipment from all threat actors and allied forces. Perfect for OPFOR training, threat assessment drills, and tactical familiarization.
                  </p>
                  <div className="pt-4 border-t border-[#E5E6DA] grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase opacity-50 mb-1">Asset Formats</div>
                      <div className="text-sm font-medium">GLB, OBJ (Classified formats available)</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase opacity-50 mb-1">Security Clearance</div>
                      <div className="text-sm font-medium">RESTRICTED</div>
                    </div>
                  </div>
                </motion.div>

                {/* Export */}
                <motion.div
                  className="p-8 hover:bg-[#E5E6DA] hover:text-[#0a0a0a] transition-colors flex flex-col h-full"
                  variants={staggerItem}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 border-2 border-[#E5E6DA] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm opacity-70 leading-relaxed mb-6 flex-1">
                    Export tactical assessments and component breakdowns for mission planning and operational briefs. Generate annotated wireframes with threat indicators, extract individual components for detailed analysis, and produce intelligence reports formatted for military planning systems. Compatible with DOD documentation standards and tactical display systems.
                  </p>
                  <div className="pt-4 border-t border-[#E5E6DA] grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase opacity-50 mb-1">Report Formats</div>
                      <div className="text-sm font-medium">PDF, GLB, JSON (Intelligence Schema)</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase opacity-50 mb-1">Applications</div>
                      <div className="text-sm font-medium">Mission Planning, Threat Briefs, Training</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="visualize" className="relative z-10">
        <div className="grid grid-cols-12">
          {/* Left Sidebar Spacer */}
          <div className="hidden lg:block col-span-1"></div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-11">
            <motion.div
              className="px-10 py-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                <div>
                  <div className="text-[10px] uppercase opacity-50 mb-4">Quick Links</div>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'Protocol', href: '#process' },
                      { name: 'Intelligence', href: '#metrics' },
                      { name: 'Systems', href: '#integrations' },
                    ].map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.querySelector(item.href);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="text-xs opacity-70 hover:text-[#3B82F6] hover:opacity-100 transition-colors cursor-pointer"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase opacity-50 mb-4">Resources</div>
                  <div className="flex flex-col gap-2">
                    <Link href="/dashboard" className="text-xs opacity-70 hover:text-[#3B82F6] hover:opacity-100 transition-colors">
                      Dashboard
                    </Link>
                    <a href="#" className="text-xs opacity-70 hover:text-[#3B82F6] hover:opacity-100 transition-colors">
                      Documentation
                    </a>
                    <a href="https://github.com/jstxw/Mesh" target="_blank" rel="noopener noreferrer" className="text-xs opacity-70 hover:text-[#3B82F6] hover:opacity-100 transition-colors">
                      GitHub
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase opacity-50">
                <div className="flex items-center gap-4">
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>

      {/* Mobile Modal */}
      {showMobileModal && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-[#0a0a0a] border-2 border-[#E5E6DA] p-8 max-w-sm w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowMobileModal(false)}
              className="absolute top-4 right-4 w-8 h-8 border border-[#E5E6DA] flex items-center justify-center hover:bg-[#E5E6DA] hover:text-[#0a0a0a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 bg-[#3B82F6]"></div>
              <span className="text-[10px] uppercase tracking-wider">DEMO ACCESS</span>
            </div>

            {/* Modal Title */}
            <h3 className="text-2xl font-sans font-medium leading-none tracking-tight text-[#E5E6DA] mb-4">
              TACTICAL DISPLAY<br />REQUIRED
            </h3>

            {/* Modal Message */}
            <p className="text-sm opacity-70 leading-relaxed mb-6">
              For optimal threat analysis and tactical visualization, access this platform on a desktop or tactical display system. Full intelligence features require larger screen real estate.
            </p>

            {/* Action Button */}
            <button
              onClick={() => setShowMobileModal(false)}
              className="w-full px-6 py-3 bg-[#3B82F6] text-[#E5E6DA] text-[10px] uppercase font-bold hover:bg-[#E5E6DA] hover:text-[#0a0a0a] transition-colors"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
