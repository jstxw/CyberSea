    export interface DemoAnnotation {
    name: string;
    description: string;
    category: string;
    annotatedImage: string; // Path to image in public folder
    }

    export interface DemoModel {
    id: string;
    name: string;
    path: string; // Path to GLB file in public folder
    annotation: DemoAnnotation; // Single default annotation for the entire model
    }

    export const DEMO_MODELS: DemoModel[] = [
    {
        id: "demo-1",
        name: "Tactical UAV Drone",
        path: "/models/drone.glb",
        annotation: {
        name: "Tactical UAV Drone System",
        description: "Military-grade unmanned aerial vehicle featuring quad-rotor propulsion, advanced stabilization systems, and reconnaissance capabilities. Used for surveillance, intelligence gathering, and tactical operations. Note this is a demo annotation and actual diagram will depend on the object and mesh selected.",
        category: "Unmanned Aerial Vehicle",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-2",
        name: "F-16 Fighting Falcon",
        path: "/models/f16-model.glb",
        annotation: {
        name: "F-16 Fighting Falcon Multirole Fighter",
        description: "Fourth-generation multirole fighter aircraft designed for air-to-air combat and air-to-ground attack missions. Features advanced avionics, afterburning turbofan engine, and proven air superiority capabilities. Highly maneuverable with 9G capability. Primary armament includes AIM-9 Sidewinder missiles, AIM-120 AMRAAM, and M61 Vulcan 20mm cannon.",
        category: "Multirole Fighter Aircraft",
        annotatedImage: "/annotations/f16-annotate.jpeg"
        }
    },
    {
        id: "demo-3",
        name: "A-10 Thunderbolt II 'Warthog'",
        path: "/models/a10.glb",
        annotation: {
        name: "A-10 Thunderbolt II Close Air Support Aircraft",
        description: "Twin-engine attack aircraft designed for close air support (CAS) of ground forces. Armed with the GAU-8/A Avenger 30mm rotary cannon, the most powerful aircraft cannon ever mounted. Capable of carrying 16,000 pounds of mixed ordnance including AGM-65 Maverick missiles, Mk 82 bombs, and cluster munitions. Titanium armor bathtub protects pilot from ground fire. Legendary for survivability and tank-killing capability.",
        category: "Close Air Support Aircraft",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-4",
        name: "F/A-18F Super Hornet",
        path: "/models/f18.glb",
        annotation: {
        name: "F/A-18F Super Hornet Multirole Fighter",
        description: "Twin-engine, carrier-capable multirole fighter designed for both air superiority and strike missions. Advanced variant featuring improved range, weapons capacity, and avionics. Powered by two F414-GE-400 turbofan engines producing 22,000 lbf thrust each. Primary fighter for US Navy carrier operations. Armed with AIM-9 Sidewinder, AIM-120 AMRAAM, AGM-88 HARM, and 20mm M61 Vulcan cannon. Capable of aerial refueling.",
        category: "Carrier-Based Multirole Fighter",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-5",
        name: "F-35 Lightning II",
        path: "/models/f35.glb",
        annotation: {
        name: "F-35 Lightning II Fifth-Generation Stealth Fighter",
        description: "Single-seat, single-engine, all-weather stealth multirole combat aircraft. Fifth-generation fighter featuring advanced sensor fusion, integrated avionics, and network-centric warfare capabilities. Powered by Pratt & Whitney F135 afterburning turbofan with 43,000 lbf thrust. Internal weapons bay maintains stealth profile. Equipped with AN/APG-81 AESA radar, distributed aperture system (DAS), and electro-optical targeting system. Capable of air-to-air, air-to-ground, and ISR missions.",
        category: "Fifth-Generation Stealth Fighter",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-6",
        name: "F-15E Strike Eagle",
        path: "/models/f15.glb",
        annotation: {
        name: "F-15E Strike Eagle Dual-Role Fighter",
        description: "Twin-engine, all-weather tactical fighter designed for both air-to-air and deep interdiction missions. Undefeated in air combat with over 100 victories. Two-seat configuration with pilot and weapons systems officer. Powered by twin Pratt & Whitney F100 turbofan engines with 29,000 lbf thrust each. Capable of carrying 24,500 pounds of ordnance on nine external hardpoints. Features AN/APG-70 radar, LANTIRN targeting pods, and advanced electronic warfare suite. Speed: Mach 2.5+.",
        category: "Dual-Role Strike Fighter",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-7",
        name: "MQ-9 Reaper",
        path: "/models/reaper.glb",
        annotation: {
        name: "MQ-9 Reaper Combat UAV",
        description: "Remotely piloted, medium-altitude, long-endurance unmanned combat aerial vehicle. Primary hunter-killer UAV for precision strike and ISR missions. Powered by Honeywell TPE331-10 turboprop engine, enabling 27-hour endurance and 50,000 ft ceiling. Armed with AGM-114 Hellfire missiles, GBU-12 Paveway II laser-guided bombs, and GBU-38 JDAM. Features MTS-B multi-spectral targeting system with infrared and electro-optical sensors. Operated via satellite link with ground control station.",
        category: "Unmanned Combat Aerial Vehicle",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-8",
        name: "SH-60B Seahawk",
        path: "/models/seahawk.glb",
        annotation: {
        name: "SH-60B Seahawk Naval Helicopter",
        description: "Twin-turboshaft, multi-mission naval helicopter designed for anti-submarine warfare (ASW), anti-surface warfare (ASUW), and search and rescue (SAR). Ship-based variant of the UH-60 Black Hawk. Powered by two General Electric T700-GE-401C engines. Equipped with APS-124 search radar, MAD (Magnetic Anomaly Detector), sonobuoys, and dipping sonar for submarine detection. Armed with Mk 46 or Mk 50 torpedoes, AGM-119 Penguin anti-ship missiles. Four-blade main rotor with automatic folding for shipboard storage.",
        category: "Naval Multi-Mission Helicopter",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-9",
        name: "T-90 Main Battle Tank",
        path: "/models/t-90.glb",
        annotation: {
        name: "T-90 Russian Main Battle Tank",
        description: "Third-generation Russian main battle tank, successor to the T-72. Powered by V-92S2 diesel engine producing 1,000 horsepower. Armed with 2A46M 125mm smoothbore cannon capable of firing both conventional ammunition and AT-11 Sniper guided missiles. Secondary armament includes 12.7mm NSV machine gun and 7.62mm PKT coaxial machine gun. Protected by Kontakt-5 explosive reactive armor (ERA) and Shtora-1 soft-kill active protection system with infrared jammers. Advanced fire control system with thermal imaging.",
        category: "Main Battle Tank",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    },
    {
        id: "demo-10",
        name: "Arleigh Burke-class Destroyer",
        path: "/models/destroyer.glb",
        annotation: {
        name: "DDG-51 Arleigh Burke-class Guided Missile Destroyer",
        description: "Multi-mission guided missile destroyer designed for air, surface, and subsurface warfare. Powered by four General Electric LM2500 gas turbines producing 100,000 shaft horsepower. Equipped with Aegis Combat System and AN/SPY-1D phased array radar for simultaneous tracking of hundreds of targets. Vertical Launch System (VLS) with 90-96 cells carrying SM-2, SM-3, SM-6 missiles, Tomahawk cruise missiles, and ASROC anti-submarine rockets. Armed with 5-inch Mk 45 naval gun, Phalanx CIWS, and torpedo tubes. Length: 509 feet, displacement: 9,200 tons.",
        category: "Guided Missile Destroyer",
        annotatedImage: "/annotations/drone-annotate.jpeg"
        }
    }
    ];

    export const getDemoAnnotation = (modelId: string): DemoAnnotation | null => {
    const model = DEMO_MODELS.find(m => m.id === modelId);
    return model?.annotation || null;
    };
