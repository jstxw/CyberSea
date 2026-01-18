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
    name: "A-10 Thunderbolt II 'Warthog' [ULTRA-HD]",
    path: "/models/professional/a10-war-thunder-330k.glb",
    annotation: {
      name: "A-10 Thunderbolt II Close Air Support Aircraft",
      description: "ULTRA-HD professional model (330,617 polygons) from War Thunder. Twin-engine attack aircraft designed for close air support (CAS) of ground forces. Armed with the GAU-8/A Avenger 30mm rotary cannon, the most powerful aircraft cannon ever mounted. Capable of carrying 16,000 pounds of mixed ordnance including AGM-65 Maverick missiles, Mk 82/84 bombs, and cluster munitions. Titanium armor bathtub protects pilot from ground fire. Legendary for survivability and tank-killing capability. Production-quality model ideal for detailed technical analysis and aerodynamic studies.",
      category: "Close Air Support Aircraft",
      annotatedImage: "/annotations/drone-annotate.jpeg"
    }
  },
  {
    id: "demo-2",
    name: "F-35A Lightning II [ULTRA-HD]",
    path: "/models/f-35a_lightning_ii.glb",
    annotation: {
      name: "F-35A Lightning II Fifth-Generation Stealth Fighter",
      description: "ULTRA-HIGH DETAIL model (121.83 MB). Single-seat, single-engine, all-weather stealth multirole combat aircraft. Powered by Pratt & Whitney F135 afterburning turbofan with 43,000 lbf thrust. Fifth-generation fighter featuring advanced sensor fusion, integrated avionics, and network-centric warfare capabilities. Internal weapons bay maintains stealth profile. Equipped with AN/APG-81 AESA radar, distributed aperture system (DAS), and electro-optical targeting system. Capable of air-to-air, air-to-ground, electronic warfare, and ISR missions. Maximum speed: Mach 1.6. Cost: $80 million per unit.",
      category: "Fifth-Generation Stealth Fighter",
      annotatedImage: "/annotations/drone-annotate.jpeg"
    }
  },
  {
    id: "demo-3",
    name: "T-90 Main Battle Tank",
    path: "/models/t-90.glb",
    annotation: {
      name: "T-90 Russian Main Battle Tank",
      description: "Third-generation Russian main battle tank, successor to the T-72. Powered by V-92S2 diesel engine producing 1,000 horsepower. Armed with 2A46M 125mm smoothbore cannon capable of firing both conventional ammunition and AT-11 Sniper guided missiles. Secondary armament includes 12.7mm NSV machine gun and 7.62mm PKT coaxial machine gun. Protected by Kontakt-5 explosive reactive armor (ERA) and Shtora-1 soft-kill active protection system with infrared jammers. Advanced fire control system with thermal imaging. Weight: 46.5 tons, max speed: 40 mph, crew: 3.",
      category: "Main Battle Tank",
      annotatedImage: "/annotations/drone-annotate.jpeg"
    }
  },
  {
    id: "demo-4",
    name: "SH-60B Seahawk Naval Helicopter",
    path: "/models/seahawk.glb",
    annotation: {
      name: "SH-60B Seahawk Multi-Mission Naval Helicopter",
      description: "Twin-turboshaft, multi-mission naval helicopter designed for anti-submarine warfare (ASW), anti-surface warfare (ASUW), and search and rescue (SAR). Ship-based variant of the UH-60 Black Hawk. Powered by two General Electric T700-GE-401C engines (1,900 shp each). Equipped with APS-124 search radar, MAD (Magnetic Anomaly Detector), sonobuoys, and dipping sonar for submarine detection. Armed with Mk 46/50 torpedoes, AGM-119 Penguin anti-ship missiles. Four-blade main rotor with automatic folding for shipboard storage. Max speed: 180 mph, range: 450 miles.",
      category: "Naval Multi-Mission Helicopter",
      annotatedImage: "/annotations/drone-annotate.jpeg"
    }
  },
  {
    id: "demo-5",
    name: "M1025 HMMWV (Humvee)",
    path: "/models/hmmwv_m998a1_soft_top/scene.gltf",
    annotation: {
      name: "M1025 HMMWV Armament Carrier",
      description: "High Mobility Multipurpose Wheeled Vehicle (HMMWV), commonly known as Humvee. Four-wheel-drive military light truck with independent suspension and high ground clearance for extreme off-road capability. M1025 variant designed as armament/weapons carrier supporting TOW missile system, Mk 19 grenade launcher, or M2 .50 caliber machine gun. Powered by 6.5L V8 diesel engine producing 190 horsepower. Payload capacity: 2,500 pounds. Central tire inflation system allows on-the-fly tire pressure adjustment for different terrain. Can be equipped with add-on armor kits. Ground clearance: 16 inches, fording depth: 30 inches.",
      category: "Light Tactical Vehicle",
      annotatedImage: "/annotations/drone-annotate.jpeg"
    }
  },
  {
    id: "demo-6",
    name: "Challenger 2 Main Battle Tank",
    path: "/models/challenger_ii.glb",
    annotation: {
      name: "Challenger 2 British Main Battle Tank - Ultra-HD",
      description: "British third-generation main battle tank with 78.4 MB high-detail model. Armed with the L30A1 120mm rifled gun (unique among modern MBTs), capable of firing HESH, APFSDS, and HEAT rounds at 3,500 m effective range. Powered by Perkins CV12 diesel engine producing 1,200 horsepower (26 hp/ton). Protected by Chobham armor (classified composite), providing exceptional frontal protection equivalent to 1,400mm RHA. Secondary armament includes 7.62mm chain gun and 7.62mm machine gun. Advanced fire control system with thermal imaging and laser rangefinder. Crew: 4 (commander, gunner, loader, driver). Weight: 62.5 tons, max speed: 37 mph. One of the most heavily armored tanks in service. Combat proven in Iraq and Afghanistan.",
      category: "Main Battle Tank",
      annotatedImage: "/annotations/drone-annotate.jpeg"
    }
  },
  {
    id: "demo-7",
    name: "Fictional Cold War Tank [ULTRA-HD]",
    path: "/models/fictional_cold_war_tank.glb",
    annotation: {
      name: "Fictional Cold War Era Tank - Speculative Design",
      description: "ULTRA-HIGH DETAIL fictional tank design (105.28 MB). Speculative Cold War-era main battle tank featuring retro-futuristic design elements inspired by 1960s-1980s armored warfare doctrine. Equipped with large-caliber smoothbore cannon (estimated 125mm), reactive armor packages, and advanced fire control systems. Design incorporates elements from Soviet T-64/T-72 and Western M60/Leopard 1 tank philosophies, representing an alternative timeline where East-West tank development converged. Heavy composite armor with ERA blocks. Twin-engine powerplant for high mobility. Four-man crew configuration with NBC (nuclear, biological, chemical) protection. Features include smoke grenade launchers, ATGM capability, and advanced optical systems for the era. Represents alternative history tank development during Cold War tensions.",
      category: "Speculative Military Design",
      annotatedImage: "/annotations/drone-annotate.jpeg"
    }
  }
];

export const getDemoAnnotation = (modelId: string): DemoAnnotation | null => {
  const model = DEMO_MODELS.find(m => m.id === modelId);
  return model?.annotation || null;
};
