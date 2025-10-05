/**
 * Asteroid Impact Mitigation and Planetary Defense Strategies
 * Provides information about prevention, deflection, and response measures
 * Based on NASA and international space agency research
 */

// Time-to-impact thresholds for different strategies
const MITIGATION_TIMEFRAMES = {
  DECADES: 10950,      // 30+ years in days
  YEARS: 3650,         // 10+ years in days
  MONTHS: 365,         // 1+ year in days
  WEEKS: 30,           // 1+ month in days
  DAYS: 1              // Less than 1 month
};

/**
 * Get appropriate mitigation strategies based on time to impact and asteroid characteristics
 * @param {number} daysUntilImpact - Days until predicted impact
 * @param {number} diameterMeters - Asteroid diameter in meters
 * @param {number} velocityKmS - Relative velocity in km/s
 * @param {number} massKg - Asteroid mass in kg
 * @returns {object} Comprehensive mitigation strategy recommendations
 */
function getMitigationStrategies(daysUntilImpact, diameterMeters, velocityKmS, massKg) {
  const strategies = {
    timeAvailable: formatTimeframe(daysUntilImpact),
    daysUntilImpact: daysUntilImpact,
    asteroidCharacteristics: {
      diameter: diameterMeters,
      mass: massKg,
      velocity: velocityKmS,
      sizeCategory: getSizeCategory(diameterMeters)
    },
    deflectionStrategies: [],
    disruptionStrategies: [],
    civilDefenseStrategies: [],
    recommendedApproach: null,
    implementationTimeline: null,
    successProbability: null,
    resourceRequirements: null
  };

  // Determine available strategies based on timeframe
  if (daysUntilImpact >= MITIGATION_TIMEFRAMES.DECADES) {
    strategies.deflectionStrategies = getGradualDeflectionMethods(diameterMeters, massKg);
    strategies.recommendedApproach = 'GRADUAL_DEFLECTION';
    strategies.successProbability = 'Very High (90-99%)';
  } else if (daysUntilImpact >= MITIGATION_TIMEFRAMES.YEARS) {
    strategies.deflectionStrategies = getRapidDeflectionMethods(diameterMeters, massKg, velocityKmS);
    strategies.recommendedApproach = 'RAPID_DEFLECTION';
    strategies.successProbability = 'High (70-90%)';
  } else if (daysUntilImpact >= MITIGATION_TIMEFRAMES.MONTHS) {
    strategies.disruptionStrategies = getDisruptionMethods(diameterMeters, massKg);
    strategies.deflectionStrategies = getEmergencyDeflection(diameterMeters, massKg);
    strategies.recommendedApproach = 'EMERGENCY_DEFLECTION_OR_DISRUPTION';
    strategies.successProbability = 'Moderate (40-70%)';
  } else if (daysUntilImpact >= MITIGATION_TIMEFRAMES.WEEKS) {
    strategies.disruptionStrategies = getLastResortDisruption(diameterMeters, massKg);
    strategies.recommendedApproach = 'LAST_RESORT_DISRUPTION';
    strategies.successProbability = 'Low to Moderate (20-50%)';
  } else {
    strategies.recommendedApproach = 'CIVIL_DEFENSE_ONLY';
    strategies.successProbability = 'Deflection not possible';
  }

  // Civil defense is always included
  strategies.civilDefenseStrategies = getCivilDefenseStrategies(daysUntilImpact, diameterMeters);

  // Add implementation timeline
  strategies.implementationTimeline = getImplementationTimeline(
    strategies.recommendedApproach,
    daysUntilImpact,
    diameterMeters
  );

  // Add resource requirements
  strategies.resourceRequirements = getResourceRequirements(
    strategies.recommendedApproach,
    diameterMeters,
    massKg
  );

  // Add international coordination requirements
  strategies.internationalCoordination = getCoordinationRequirements(
    strategies.recommendedApproach,
    daysUntilImpact
  );

  return strategies;
}

/**
 * Gradual deflection methods (decades of warning time)
 */
function getGradualDeflectionMethods(diameterMeters, massKg) {
  return [
    {
      method: 'Gravity Tractor',
      description: 'Use spacecraft\'s gravitational pull to slowly alter asteroid orbit',
      advantages: [
        'Most precise and controllable method',
        'No risk of fragmentation',
        'Can be adjusted in real-time',
        'Works on any composition'
      ],
      disadvantages: [
        'Requires decades of lead time',
        'Very slow process',
        'Requires sustained mission (10-20 years)',
        'High cost for long-duration mission'
      ],
      technicalRequirements: {
        spacecraftMass: '10-20 metric tons',
        missionDuration: '10-30 years',
        thrusterType: 'Ion propulsion',
        powerSource: 'Nuclear or large solar arrays'
      },
      effectiveness: diameterMeters < 500 ? 'Excellent' : 'Good',
      estimatedCost: '$5-15 billion',
      technologyReadiness: 'High (TRL 6-7)',
      references: ['NASA DART mission concepts', 'ESA Don Quijote mission study']
    },
    {
      method: 'Ion Beam Deflection',
      description: 'Use ion beam from spacecraft to ablate asteroid surface and create thrust',
      advantages: [
        'Highly controllable',
        'No physical contact required',
        'Can work on irregular shapes',
        'Continuous thrust application'
      ],
      disadvantages: [
        'Requires long mission duration',
        'High power requirements',
        'Complex spacecraft design',
        'Untested in actual missions'
      ],
      technicalRequirements: {
        ionBeamPower: '50-200 kW',
        spacecraftDistance: '50-100 meters',
        missionDuration: '5-15 years',
        powerSource: 'Nuclear reactor'
      },
      effectiveness: diameterMeters < 300 ? 'Excellent' : 'Good',
      estimatedCost: '$3-10 billion',
      technologyReadiness: 'Medium (TRL 4-5)',
      references: ['NASA IBS study', 'European space agency concepts']
    },
    {
      method: 'Solar Sail / Reflector',
      description: 'Attach reflective material to asteroid to use solar radiation pressure',
      advantages: [
        'Uses free energy source (sunlight)',
        'No propellant required',
        'Scalable to large asteroids',
        'Continuous acceleration'
      ],
      disadvantages: [
        'Very slow process',
        'Requires decades of operation',
        'Complex deployment on asteroid',
        'Vulnerable to micrometeorite damage'
      ],
      technicalRequirements: {
        sailArea: `${Math.round(diameterMeters * 2)} - ${Math.round(diameterMeters * 5)} mÂ²`,
        attachmentMethod: 'Harpoons, anchors, or adhesive',
        missionDuration: '20-50 years',
        maintenanceRequirement: 'Periodic inspection/repair'
      },
      effectiveness: diameterMeters < 200 ? 'Good' : 'Limited',
      estimatedCost: '$4-12 billion',
      technologyReadiness: 'Low-Medium (TRL 3-4)',
      references: ['Solar sail mission concepts', 'IKAROS mission experience']
    },
    {
      method: 'Mass Driver',
      description: 'Land on asteroid and launch excavated material to create thrust',
      advantages: [
        'Uses asteroid\'s own material',
        'Efficient mass utilization',
        'Can work for extended periods',
        'Scalable thrust'
      ],
      disadvantages: [
        'Complex surface operations',
        'Requires landing and anchoring',
        'Uncertain asteroid composition',
        'High development cost'
      ],
      technicalRequirements: {
        excavationRate: '1-10 kg/s',
        launchVelocity: '10-100 m/s',
        powerRequirement: '100-500 kW',
        missionDuration: '5-20 years'
      },
      effectiveness: 'Good for all sizes if time permits',
      estimatedCost: '$8-20 billion',
      technologyReadiness: 'Low (TRL 2-3)',
      references: ['O\'Neill mass driver concepts', 'Asteroid mining studies']
    }
  ];
}

/**
 * Rapid deflection methods (years of warning time)
 */
function getRapidDeflectionMethods(diameterMeters, massKg, velocityKmS) {
  const kineticImpactorMass = Math.min(massKg * 0.0001, 10000); // 0.01% of asteroid mass or 10 tons max
  
  return [
    {
      method: 'Kinetic Impactor',
      description: 'High-speed spacecraft collision to change asteroid velocity',
      advantages: [
        'Proven technology (NASA DART mission)',
        'Relatively simple design',
        'Can be launched quickly',
        'High success probability'
      ],
      disadvantages: [
        'Risk of fragmentation for rubble piles',
        'Requires precise targeting',
        'Single attempt (no retry)',
        'Uncertain momentum transfer efficiency'
      ],
      technicalRequirements: {
        spacecraftMass: `${Math.round(kineticImpactorMass / 1000)} metric tons`,
        impactVelocity: `${Math.round(velocityKmS + 10)} km/s`,
        targetingAccuracy: '< 1 meter',
        launchWindow: '1-5 years before impact'
      },
      velocityChange: calculateVelocityChange(kineticImpactorMass, massKg, velocityKmS),
      effectiveness: diameterMeters < 500 ? 'Excellent' : 'Good',
      estimatedCost: '$1-3 billion',
      technologyReadiness: 'Very High (TRL 9 - DART mission success)',
      missionExamples: ['NASA DART (2022)', 'ESA Hera follow-up mission'],
      references: ['DART mission results', 'Dimorphos impact data']
    },
    {
      method: 'Multiple Kinetic Impactors',
      description: 'Series of spacecraft impacts to accumulate velocity change',
      advantages: [
        'Higher total momentum transfer',
        'Can adjust strategy between impacts',
        'Redundancy if one fails',
        'Better for larger asteroids'
      ],
      disadvantages: [
        'Higher cost',
        'Complex mission coordination',
        'Longer timeline needed',
        'Risk of fragmentation increases'
      ],
      technicalRequirements: {
        numberOfImpacts: diameterMeters > 300 ? '3-5' : '2-3',
        timeBetweenImpacts: '6-18 months',
        coordinatedLaunch: 'Multiple launch vehicles',
        totalMissionDuration: '2-5 years'
      },
      velocityChange: calculateVelocityChange(kineticImpactorMass * 3, massKg, velocityKmS),
      effectiveness: 'Excellent for large asteroids',
      estimatedCost: '$3-8 billion',
      technologyReadiness: 'High (based on DART)',
      references: ['Multiple impactor studies', 'NEO deflection scenarios']
    },
    {
      method: 'Enhanced Kinetic Impactor with Explosive',
      description: 'Kinetic impactor carrying conventional explosive to enhance crater ejecta',
      advantages: [
        'Greater momentum transfer than pure kinetic',
        'More predictable than nuclear',
        'Can be tested on Earth',
        'Faster than gravity tractor'
      ],
      disadvantages: [
        'Still risk of fragmentation',
        'Limited enhancement over pure kinetic',
        'Complex timing requirements',
        'May destabilize rubble pile asteroids'
      ],
      technicalRequirements: {
        explosiveMass: '500-2000 kg TNT equivalent',
        detonationTiming: 'Milliseconds after impact',
        craterDepth: '10-50 meters',
        optimalImpactAngle: '30-45 degrees from normal'
      },
      velocityChange: calculateVelocityChange(kineticImpactorMass * 2, massKg, velocityKmS),
      effectiveness: 'Very Good',
      estimatedCost: '$2-4 billion',
      technologyReadiness: 'Medium-High (TRL 5-6)',
      references: ['Hypervelocity impact studies', 'Crater ejecta modeling']
    }
  ];
}

/**
 * Emergency deflection methods (months of warning time)
 */
function getEmergencyDeflection(diameterMeters, massKg) {
  return [
    {
      method: 'Nuclear Standoff Burst',
      description: 'Detonate nuclear device near (not on) asteroid to vaporize surface and create thrust',
      advantages: [
        'Most powerful option available',
        'Can deflect large asteroids',
        'Works within short timeframe',
        'No fragmentation if done correctly'
      ],
      disadvantages: [
        'Political/legal complications (Outer Space Treaty)',
        'Risk of fragmentation if too close',
        'Radioactive contamination concerns',
        'Requires nuclear device in space'
      ],
      technicalRequirements: {
        deviceYield: diameterMeters > 500 ? '1-10 megatons' : '100 kilotons - 1 megaton',
        standoffDistance: `${diameterMeters * 2}-${diameterMeters * 5} meters`,
        detonationTiming: 'Months before impact',
        precursorMission: 'Orbital characterization required'
      },
      velocityChange: `${(0.01 * Math.sqrt(diameterMeters)).toFixed(3)} - ${(0.05 * Math.sqrt(diameterMeters)).toFixed(3)} km/s`,
      effectiveness: 'Excellent if executed properly',
      estimatedCost: '$5-15 billion (including political negotiations)',
      technologyReadiness: 'High (nuclear technology mature)',
      legalChallenges: 'Outer Space Treaty Article IV restrictions',
      internationalApproval: 'UN Security Council approval required',
      references: ['National labs nuclear simulation studies', 'NNSA planetary defense studies']
    },
    {
      method: 'Laser Ablation (Orbital Platform)',
      description: 'High-power laser array to vaporize asteroid surface material',
      advantages: [
        'Can be operated remotely',
        'Continuous thrust application',
        'Precise control',
        'No contamination'
      ],
      disadvantages: [
        'Requires pre-positioned infrastructure',
        'Very high power requirements',
        'Limited to smaller asteroids',
        'Technology not yet developed'
      ],
      technicalRequirements: {
        laserPower: '50-500 MW',
        beamDuration: 'Continuous for weeks/months',
        platformLocation: 'Earth orbit or asteroid vicinity',
        powerSource: 'Nuclear reactor or massive solar array'
      },
      effectiveness: diameterMeters < 100 ? 'Good' : 'Limited',
      estimatedCost: '$20-50 billion (infrastructure development)',
      technologyReadiness: 'Very Low (TRL 1-2)',
      developmentTime: '15-25 years to deploy',
      references: ['DE-STAR concept studies', 'Laser propulsion research']
    }
  ];
}

/**
 * Disruption methods (months of warning time)
 */
function getDisruptionMethods(diameterMeters, massKg) {
  return [
    {
      method: 'Nuclear Surface Burst',
      description: 'Detonate nuclear device on or just below asteroid surface to fragment it',
      advantages: [
        'Can break up large asteroids',
        'Disperses fragments over wider area',
        'May reduce individual fragment impacts',
        'Last resort option'
      ],
      disadvantages: [
        'HIGHLY RISKY - May create multiple impacts',
        'Fragments may still hit Earth',
        'Radioactive contamination',
        'Unpredictable fragmentation',
        'Could make situation worse'
      ],
      technicalRequirements: {
        deviceYield: '1-100 megatons',
        penetrationDepth: '10-100 meters (for subsurface)',
        detonationTiming: 'Critical - too late and fragments still impact',
        fragmentTracking: 'Comprehensive radar/optical network'
      },
      warning: 'EXTREME RISK - Only use if no other option exists and impact is certain',
      effectiveness: 'Uncertain - may reduce total damage or create multiple disasters',
      estimatedCost: '$3-10 billion',
      technologyReadiness: 'Medium (nuclear technology mature, but never tested on asteroid)',
      ethicalConcerns: 'High - risk vs. reward analysis critical',
      references: ['National labs disruption studies', 'Fragmentation modeling']
    },
    {
      method: 'Focused Kinetic Impact (Fragmentation)',
      description: 'Multiple simultaneous kinetic impacts designed to shatter asteroid',
      advantages: [
        'No nuclear devices required',
        'More politically acceptable',
        'Can launch quickly',
        'Proven technology basis'
      ],
      disadvantages: [
        'Fragments may still impact',
        'Requires many spacecraft',
        'Precise coordination needed',
        'May not fully disrupt solid asteroids'
      ],
      technicalRequirements: {
        numberOfImpactors: '5-20',
        synchronization: 'Within milliseconds',
        targetPoints: 'Structural weak points',
        preImpactReconnaissance: 'Essential for targeting'
      },
      warning: 'RISK - Fragmentation may create multiple impact zones',
      effectiveness: diameterMeters < 300 ? 'Moderate' : 'Low',
      estimatedCost: '$5-15 billion',
      technologyReadiness: 'Medium-High (TRL 6)',
      references: ['Multi-impactor studies', 'Asteroid structural analysis']
    }
  ];
}

/**
 * Last resort disruption (weeks of warning time)
 */
function getLastResortDisruption(diameterMeters, massKg) {
  return [
    {
      method: 'Emergency Nuclear Disruption',
      description: 'Immediate nuclear fragmentation attempt',
      status: 'LAST RESORT ONLY',
      advantages: [
        'Only option with very short notice',
        'May reduce total impact energy',
        'Could disperse fragments'
      ],
      disadvantages: [
        'EXTREMELY RISKY',
        'Unpredictable results',
        'Multiple fragment impacts likely',
        'May worsen situation',
        'No time for proper mission planning'
      ],
      warning: 'SUCCESS PROBABILITY VERY LOW - May create multiple disasters instead of one',
      effectiveness: 'Highly uncertain',
      recommendation: 'Focus on civil defense and evacuation instead'
    }
  ];
}

/**
 * Civil defense strategies
 */
function getCivilDefenseStrategies(daysUntilImpact, diameterMeters) {
  const energyMegatons = Math.pow(diameterMeters / 10, 3) * 0.001; // Rough estimate
  
  const strategies = [
    {
      priority: 1,
      strategy: 'Early Warning System',
      description: 'Establish global asteroid detection and tracking network',
      actions: [
        'Expand ground-based telescope networks',
        'Deploy space-based infrared detectors',
        'Improve orbital calculation accuracy',
        'International data sharing protocols',
        'Public alert systems'
      ],
      timeframe: 'Immediate - ongoing',
      cost: '$500 million - $2 billion annually',
      benefit: 'Maximizes warning time for any detected threat'
    },
    {
      priority: 2,
      strategy: 'Impact Zone Identification',
      description: 'Calculate precise impact location and effects',
      actions: [
        'Refine orbital calculations',
        'Model atmospheric entry',
        'Calculate ground zero',
        'Map blast radius and effects',
        'Identify populations at risk'
      ],
      timeframe: daysUntilImpact > 30 ? 'Weeks before impact' : 'Immediately',
      cost: '$50-100 million',
      benefit: 'Enables targeted evacuation and resource deployment'
    },
    {
      priority: 3,
      strategy: 'Mass Evacuation',
      description: 'Evacuate population from impact zone and surrounding areas',
      actions: [
        'Declare state of emergency',
        'Establish evacuation zones',
        'Coordinate transportation',
        'Set up refugee camps',
        'Medical and food supplies',
        'Security and law enforcement'
      ],
      timeframe: daysUntilImpact > 7 ? 'Begin immediately' : 'May not be feasible',
      cost: energyMegatons > 100 ? '$100+ billion' : '$10-50 billion',
      benefit: 'Save millions of lives in impact zone',
      challenges: [
        'Panic and social disorder',
        'Transportation bottlenecks',
        'Refugee support infrastructure',
        'Duration of displacement'
      ]
    },
    {
      priority: 4,
      strategy: 'Shelter-in-Place Protocols',
      description: 'For areas where evacuation is not possible',
      actions: [
        'Underground shelter identification',
        'Reinforced building protocols',
        'Supply stockpiling (food, water, medical)',
        'Communication systems',
        'Emergency services preparation'
      ],
      timeframe: 'Immediate',
      cost: '$5-20 billion',
      benefit: 'Reduce casualties in areas that cannot be evacuated',
      effectiveness: energyMegatons > 10 ? 'Limited' : 'Moderate'
    },
    {
      priority: 5,
      strategy: 'Critical Infrastructure Protection',
      description: 'Protect essential services and prepare for recovery',
      actions: [
        'Backup power generation',
        'Water system protection',
        'Communication network redundancy',
        'Medical facility preparation',
        'Emergency response coordination',
        'Supply chain security'
      ],
      timeframe: 'Immediate',
      cost: '$20-100 billion',
      benefit: 'Enable faster recovery and reduce secondary casualties'
    },
    {
      priority: 6,
      strategy: 'International Coordination',
      description: 'Global response and resource sharing',
      actions: [
        'Activate UN disaster response',
        'International aid mobilization',
        'Scientific collaboration',
        'Military logistics support',
        'Financial assistance',
        'Post-impact recovery planning'
      ],
      timeframe: 'Immediate',
      cost: 'Variable - international burden sharing',
      benefit: 'Leverage global resources and expertise'
    }
  ];

  // Add specific recommendations based on timeframe
  if (daysUntilImpact < 7) {
    strategies.push({
      priority: 0,
      strategy: 'IMMEDIATE ACTIONS - LIMITED TIME',
      description: 'Critical actions when impact is imminent',
      actions: [
        'Issue emergency alerts to all affected populations',
        'Order immediate shelter in underground facilities',
        'Position emergency services outside impact zone',
        'Prepare trauma centers for mass casualties',
        'Begin documentation for post-impact recovery',
        'Activate military disaster response'
      ],
      timeframe: 'NOW - Hours remaining',
      urgency: 'CRITICAL',
      note: 'With less than one week, deflection is impossible. Focus entirely on saving lives through shelter and emergency response.'
    });
  }

  return strategies;
}

/**
 * Calculate velocity change from kinetic impactor
 */
function calculateVelocityChange(impactorMass, asteroidMass, velocityKmS) {
  // Momentum transfer with beta factor (momentum enhancement)
  const beta = 2.0; // Typical momentum enhancement factor from crater ejecta
  const deltaV = (beta * impactorMass * velocityKmS * 1000) / asteroidMass; // m/s
  
  return {
    deltaV_ms: deltaV.toFixed(6),
    deltaV_kmh: (deltaV * 3.6).toFixed(4),
    note: `Assumes momentum enhancement factor β = ${beta} from crater ejecta`
  };
}

/**
 * Get size category
 */
function getSizeCategory(diameterMeters) {
  if (diameterMeters < 25) return 'Very Small (<25m) - Mostly burns up in atmosphere';
  if (diameterMeters < 50) return 'Small (25-50m) - Local damage';
  if (diameterMeters < 140) return 'Medium (50-140m) - Regional damage';
  if (diameterMeters < 1000) return 'Large (140-1000m) - Continental damage';
  return 'Very Large (>1km) - Global catastrophe';
}

/**
 * Format timeframe
 */
function formatTimeframe(days) {
  if (days < 1) return 'Less than 1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

/**
 * Get implementation timeline
 */
function getImplementationTimeline(approach, daysUntilImpact, diameterMeters) {
  const timelines = {
    'GRADUAL_DEFLECTION': {
      phases: [
        { phase: 'Reconnaissance Mission', duration: '1-2 years', description: 'Detailed asteroid characterization' },
        { phase: 'Mission Design & Approval', duration: '1-2 years', description: 'Engineering, funding, international coordination' },
        { phase: 'Spacecraft Construction', duration: '2-4 years', description: 'Build and test deflection system' },
        { phase: 'Launch & Transit', duration: '1-3 years', description: 'Launch and journey to asteroid' },
        { phase: 'Deflection Operations', duration: '5-20 years', description: 'Active deflection period' },
        { phase: 'Monitoring & Adjustment', duration: 'Ongoing', description: 'Track orbital changes' }
      ],
      totalDuration: '10-30 years',
      criticalPath: 'Spacecraft construction and deflection operations'
    },
    'RAPID_DEFLECTION': {
      phases: [
        { phase: 'Emergency Assessment', duration: '1-6 months', description: 'Confirm threat and target data' },
        { phase: 'Mission Authorization', duration: '3-6 months', description: 'Fast-track approval process' },
        { phase: 'Spacecraft Construction', duration: '1-2 years', description: 'Build kinetic impactor' },
        { phase: 'Launch', duration: '1-3 months', description: 'Launch window preparation' },
        { phase: 'Intercept & Impact', duration: '6 months - 2 years', description: 'Transit and impact' },
        { phase: 'Orbit Verification', duration: '3-12 months', description: 'Confirm deflection success' }
      ],
      totalDuration: '2-5 years',
      criticalPath: 'Spacecraft construction and launch window'
    },
    'EMERGENCY_DEFLECTION_OR_DISRUPTION': {
      phases: [
        { phase: 'Emergency Authorization', duration: '1-2 weeks', description: 'Emergency UN/government approval' },
        { phase: 'Rapid Spacecraft Preparation', duration: '2-6 months', description: 'Use existing hardware or rapid build' },
        { phase: 'Launch', duration: '1-4 weeks', description: 'Immediate launch' },
        { phase: 'Intercept Mission', duration: '1-6 months', description: 'Fast transit to target' },
        { phase: 'Civil Defense Parallel Track', duration: 'Simultaneous', description: 'Evacuations and preparations' }
      ],
      totalDuration: '3-12 months',
      criticalPath: 'Every phase is critical - no margin for error',
      note: 'Success probability is low - civil defense is primary strategy'
    },
    'LAST_RESORT_DISRUPTION': {
      phases: [
        { phase: 'Emergency Decision', duration: '24-48 hours', description: 'Decide to attempt disruption' },
        { phase: 'Prepare Available Assets', duration: '1-4 weeks', description: 'Use any available launch capability' },
        { phase: 'Launch & Intercept', duration: '1-4 weeks', description: 'Immediate intercept attempt' },
        { phase: 'Primary Focus: Civil Defense', duration: 'All remaining time', description: 'Evacuations and shelter' }
      ],
      totalDuration: '2-8 weeks',
      criticalPath: 'Civil defense is primary strategy',
      warning: 'Deflection attempt has very low probability of success'
    },
    'CIVIL_DEFENSE_ONLY': {
      phases: [
        { phase: 'Emergency Declaration', duration: 'Immediate', description: 'Declare state of emergency' },
        { phase: 'Evacuation', duration: 'All available time', description: 'Mass evacuation of impact zone' },
        { phase: 'Shelter Preparation', duration: 'Parallel', description: 'For those who cannot evacuate' },
        { phase: 'Emergency Services', duration: 'Ongoing', description: 'Position resources for response' },
        { phase: 'Impact & Response', duration: 'Post-impact', description: 'Search, rescue, recovery' }
      ],
      totalDuration: 'All remaining time',
      note: 'Insufficient time for deflection - focus entirely on saving lives'
    }
  };

  return timelines[approach] || { note: 'No timeline available for this approach' };
}

/**
 * Get resource requirements
 */
function getResourceRequirements(approach, diameterMeters, massKg) {
  const requirements = {
    financial: null,
    technical: [],
    personnel: null,
    international: [],
    infrastructure: []
  };

  switch (approach) {
    case 'GRADUAL_DEFLECTION':
      requirements.financial = '$5-20 billion';
      requirements.technical = [
        'Advanced ion propulsion systems',
        'Deep space communications',
        'Precision navigation',
        'Long-duration spacecraft operations',
        'Nuclear power sources (for some methods)'
      ];
      requirements.personnel = '500-2000 scientists, engineers, mission specialists';
      requirements.international = [
        'UN Committee on the Peaceful Uses of Outer Space (COPUOS)',
        'International Asteroid Warning Network (IAWN)',
        'Space Mission Planning Advisory Group (SMPAG)',
        'Multiple space agencies (NASA, ESA, JAXA, etc.)',
        'International funding consortium'
      ];
      requirements.infrastructure = [
        'Launch facilities',
        'Deep space network communications',
        'Mission control centers',
        'Spacecraft manufacturing facilities',
        'Testing and simulation facilities'
      ];
      break;

    case 'RAPID_DEFLECTION':
      requirements.financial = '$1-5 billion';
      requirements.technical = [
        'Kinetic impactor spacecraft',
        'Precision guidance systems',
        'Heavy-lift launch vehicles',
        'Real-time tracking network',
        'Impact verification systems'
      ];
      requirements.personnel = '200-500 mission specialists';
      requirements.international = [
        'Emergency UN authorization',
        'International space agencies coordination',
        'Global tracking network access',
        'Launch facility cooperation'
      ];
      requirements.infrastructure = [
        'Immediate launch capability',
        'Existing spacecraft or rapid manufacturing',
        'Global tracking stations',
        'Mission operations centers'
      ];
      break;

    case 'EMERGENCY_DEFLECTION_OR_DISRUPTION':
      requirements.financial = '$2-10 billion';
      requirements.technical = [
        'Nuclear device (if nuclear option)',
        'Emergency launch capability',
        'Minimal testing protocols',
        'Real-time guidance systems',
        'Fragment tracking capability'
      ];
      requirements.personnel = '100-300 emergency response team';
      requirements.international = [
        'Emergency UN Security Council approval',
        'Nuclear weapons state cooperation (if nuclear)',
        'International legal waivers',
        'Global civil defense coordination'
      ];
      requirements.infrastructure = [
        'Any available launch system',
        'Emergency manufacturing',
        'Military logistics support',
        'Civil defense infrastructure'
      ];
      break;

    case 'LAST_RESORT_DISRUPTION':
    case 'CIVIL_DEFENSE_ONLY':
      requirements.financial = '$10-100+ billion (civil defense)';
      requirements.technical = [
        'Mass communication systems',
        'Transportation networks',
        'Shelter infrastructure',
        'Emergency medical systems',
        'Post-impact recovery equipment'
      ];
      requirements.personnel = 'Millions - government, military, emergency services, volunteers';
      requirements.international = [
        'UN disaster response activation',
        'International humanitarian aid',
        'Refugee assistance',
        'Medical and supply support',
        'Post-impact reconstruction'
      ];
      requirements.infrastructure = [
        'Evacuation routes and transportation',
        'Shelter facilities',
        'Emergency supply stockpiles',
        'Medical facilities',
        'Communication networks',
        'Post-impact recovery equipment'
      ];
      break;
  }

  return requirements;
}

/**
 * Get international coordination requirements
 */
function getCoordinationRequirements(approach, daysUntilImpact) {
  const urgency = daysUntilImpact < 365 ? 'URGENT' : daysUntilImpact < 3650 ? 'HIGH' : 'NORMAL';

  return {
    urgencyLevel: urgency,
    keyOrganizations: [
      'United Nations Office for Outer Space Affairs (UNOOSA)',
      'International Asteroid Warning Network (IAWN)',
      'Space Mission Planning Advisory Group (SMPAG)',
      'International Council of Scientific Unions (ICSU)',
      'National space agencies (NASA, ESA, Roscosmos, CNSA, JAXA, ISRO)'
    ],
    requiredAgreements: [
      'Outer Space Treaty compliance (or emergency waiver)',
      'Nuclear Test Ban Treaty considerations (if nuclear option)',
      'Liability Convention protocols',
      'Registration Convention compliance',
      'Rescue Agreement activation'
    ],
    decisionMakingProcess: urgency === 'URGENT' 
      ? 'Emergency UN Security Council session with fast-track approval'
      : urgency === 'HIGH'
      ? 'UN General Assembly with COPUOS technical review'
      : 'Standard international space mission approval process',
    fundingModel: {
      primary: 'Affected nations and major space powers',
      secondary: 'International burden-sharing based on GDP',
      emergency: 'Global solidarity fund for planetary defense'
    },
    legalFramework: {
      missionApproval: 'UN authorization required',
      liability: 'Shared under international protocols',
      nuclearUse: 'Requires Security Council unanimous approval',
      dataSharing: 'Mandatory transparency for all tracking data'
    }
  };
}

/**
 * Main function to get comprehensive mitigation information
 * @param {object} impactData - Impact data from customHitHandler
 * @returns {object} Complete mitigation strategy recommendations
 */
function addMitigationStrategies(impactData) {
  try {
    const input = impactData.input;
    const calculations = impactData.calculations;

    // Extract required data
    const impactDate = new Date(input.date);
    const now = new Date();
    const daysUntilImpact = Math.max(0, Math.floor((impactDate - now) / (1000 * 60 * 60 * 24)));
    
    const diameterMeters = input.size.diameter;
    const massKg = calculations.mass.value;
    const velocityKmS = input.velocity.kilometersPerSecond;

    // Get mitigation strategies
    const strategies = getMitigationStrategies(
      daysUntilImpact,
      diameterMeters,
      velocityKmS,
      massKg
    );

    // Add current detection and tracking capabilities
    const currentCapabilities = {
      detection: {
        groundBasedTelescopes: [
          'Pan-STARRS (Hawaii)',
          'Catalina Sky Survey (Arizona)',
          'ATLAS (Hawaii)',
          'Spacewatch (Arizona)',
          'LINEAR (New Mexico)'
        ],
        spaceBasedSystems: [
          'NEOWISE (NASA infrared space telescope)',
          'Future: NEO Surveyor mission (planned)'
        ],
        detectionLimit: '~140 meters for 90% completeness',
        trackingAccuracy: 'Orbital uncertainty: ±1000 km (improves with time)',
        warningTime: {
          optimal: '10-50 years for large asteroids',
          current: '0-20 years (depends on discovery)',
          goal: '100+ years through improved detection'
        }
      },
      internationalCoordination: {
        iawn: {
          name: 'International Asteroid Warning Network',
          role: 'Detect, track, and characterize NEOs',
          members: '20+ observatories worldwide'
        },
        smpag: {
          name: 'Space Mission Planning Advisory Group',
          role: 'Plan and coordinate deflection missions',
          members: '18 space agencies'
        },
        pdc: {
          name: 'Planetary Defense Conference',
          role: 'Biennial meeting to discuss NEO threats',
          status: 'Active since 2004'
        }
      }
    };

    // Add technology readiness assessment
    const technologyStatus = {
      readyNow: [
        'Kinetic impactor (TRL 9 - DART mission success)',
        'Asteroid reconnaissance missions (TRL 9)',
        'Ground-based detection (TRL 9)',
        'Orbital tracking (TRL 9)'
      ],
      nearTermReady: [
        'Gravity tractor (TRL 6-7)',
        'Enhanced kinetic impactor (TRL 6)',
        'Nuclear standoff burst (TRL 5-6)'
      ],
      longTermDevelopment: [
        'Ion beam deflection (TRL 4-5)',
        'Laser ablation (TRL 2-3)',
        'Mass driver (TRL 2-3)',
        'Solar sail attachment (TRL 3-4)'
      ]
    };

    // Add key mitigation principles
    const mitigationPrinciples = {
      earlyDetection: {
        principle: 'Earlier detection = more options and higher success probability',
        goal: 'Detect all potentially hazardous asteroids decades before potential impact',
        currentGap: 'Only ~40% of 140m+ NEOs have been discovered',
        recommendation: 'Increase funding for detection programs'
      },
      graduatedResponse: {
        principle: 'Use the least disruptive method that will be effective',
        hierarchy: [
          '1st choice: Gentle deflection (gravity tractor, ion beam)',
          '2nd choice: Kinetic impact',
          '3rd choice: Nuclear standoff',
          'Last resort: Disruption (high risk)'
        ]
      },
      deflectionNotDisruption: {
        principle: 'Deflection is always preferred over disruption',
        reason: 'Disruption creates multiple impacts instead of one',
        exception: 'Only if deflection is impossible and fragments would be survivable'
      },
      civilDefenseAlways: {
        principle: 'Civil defense preparations must accompany any deflection attempt',
        reason: 'Deflection missions may fail - must have backup plan',
        components: 'Evacuation, shelter, emergency response, recovery'
      },
      internationalCooperation: {
        principle: 'Asteroid threats are global - response must be coordinated',
        requirement: 'No nation can act unilaterally on planetary defense',
        framework: 'UN-led international coordination'
      }
    };

    return {
      ...impactData,
      mitigationData: {
        timeAvailable: strategies.timeAvailable,
        daysUntilImpact: daysUntilImpact,
        recommendedApproach: strategies.recommendedApproach,
        successProbability: strategies.successProbability,
        
        deflectionStrategies: strategies.deflectionStrategies,
        disruptionStrategies: strategies.disruptionStrategies,
        civilDefenseStrategies: strategies.civilDefenseStrategies,
        
        implementationTimeline: strategies.implementationTimeline,
        resourceRequirements: strategies.resourceRequirements,
        internationalCoordination: strategies.internationalCoordination,
        
        currentCapabilities: currentCapabilities,
        technologyStatus: technologyStatus,
        mitigationPrinciples: mitigationPrinciples,
        
        keyRecommendations: generateKeyRecommendations(
          daysUntilImpact,
          diameterMeters,
          strategies.recommendedApproach
        ),
        
        references: [
          'NASA Planetary Defense Coordination Office (PDCO)',
          'ESA Space Situational Awareness Programme',
          'NASA DART Mission Results (2022)',
          'National Academies Report: Defending Planet Earth (2010)',
          'UN COPUOS Guidelines for Planetary Defense',
          'International Academy of Astronautics Position Paper on Planetary Defense',
          'B612 Foundation Asteroid Institute Research'
        ]
      }
    };

  } catch (error) {
    console.error('Error adding mitigation strategies:', error);
    return {
      ...impactData,
      mitigationData: {
        error: 'Failed to generate mitigation strategies',
        details: error.message
      }
    };
  }
}

/**
 * Generate key recommendations summary
 */
function generateKeyRecommendations(daysUntilImpact, diameterMeters, approach) {
  const recommendations = [];

  if (daysUntilImpact > 3650) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Begin reconnaissance mission immediately',
      rationale: 'Time allows for detailed characterization before deflection'
    });
    recommendations.push({
      priority: 'HIGH',
      action: 'Develop gravity tractor or ion beam deflection mission',
      rationale: 'Gentle deflection methods have highest success probability'
    });
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Establish international coordination framework',
      rationale: 'Adequate time for proper international cooperation'
    });
  } else if (daysUntilImpact > 365) {
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Design and launch kinetic impactor mission immediately',
      rationale: 'Proven technology with good success probability'
    });
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Begin civil defense preparations in parallel',
      rationale: 'Must have backup plan if deflection fails'
    });
    recommendations.push({
      priority: 'HIGH',
      action: 'Secure emergency international approval and funding',
      rationale: 'Limited time requires fast-track processes'
    });
  } else if (daysUntilImpact > 30) {
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Evaluate nuclear standoff burst option',
      rationale: 'May be only deflection option with remaining time'
    });
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Focus primarily on mass evacuation',
      rationale: 'Civil defense is now primary life-saving strategy'
    });
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Emergency UN Security Council authorization',
      rationale: 'Any deflection attempt requires immediate approval'
    });
  } else {
    recommendations.push({
      priority: 'CRITICAL',
      action: 'EVACUATE impact zone immediately',
      rationale: 'Insufficient time for deflection - focus on saving lives'
    });
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Activate all emergency response systems',
      rationale: 'Prepare for immediate post-impact rescue and recovery'
    });
    recommendations.push({
      priority: 'CRITICAL',
      action: 'Position resources outside impact zone',
      rationale: 'Emergency services must survive to respond'
    });
  }

  // Add size-specific recommendations
  if (diameterMeters > 1000) {
    recommendations.push({
      priority: 'CRITICAL',
      action: 'This is a potential extinction-level event',
      rationale: 'Global response required - survival of humanity at stake'
    });
  }

  return recommendations;
}

module.exports = {
  getMitigationStrategies,
  addMitigationStrategies,
  getGradualDeflectionMethods,
  getRapidDeflectionMethods,
  getEmergencyDeflection,
  getDisruptionMethods,
  getCivilDefenseStrategies
}