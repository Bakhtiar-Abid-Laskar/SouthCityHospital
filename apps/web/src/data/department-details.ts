/**
 * South City Hospital — Detailed Clinical Department Data
 * Substantive clinical information for all 13 specialized departments.
 */

export interface DepartmentDetail {
  slug: string;
  name: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  overviewParagraphs: string[];
  keySpecializations: Array<{
    title: string;
    description: string;
  }>;
  procedures: Array<{
    name: string;
    description: string;
  }>;
  facilitiesAndTech: string[];
  whenToConsult: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const departmentDetails: Record<string, DepartmentDetail> = {
  "internal-medicine": {
    slug: "internal-medicine",
    name: "Internal Medicine",
    tagline: "Comprehensive adult primary care, diagnostics, and chronic disease management.",
    metaTitle: "Internal Medicine Specialists in Silchar",
    metaDescription:
      "Consult internal medicine doctors at South City Hospital in Silchar for hypertension, diabetes, infectious illnesses, and chronic health management.",
    overviewParagraphs: [
      "The Department of Internal Medicine at South City Hospital serves as the cornerstone of our comprehensive adult medical care. Our consultant physicians specialize in diagnosing, managing, and preventing complex, multi-system illnesses that affect adult patients across Silchar and the southern Assam region.",
      "From routine acute medical conditions to challenging chronic disorders like uncontrolled diabetes, hypertension, metabolic syndrome, and autoimmune disorders, our internal medicine team coordinates closely with sub-specialists, intensive care units, and diagnostic laboratories to provide integrated clinical care.",
      "Our inpatient wards and step-down medical units provide 24/7 continuous monitoring for patients requiring acute medical stabilization, ensuring seamless care from hospital admission to post-discharge recovery."
    ],
    keySpecializations: [
      {
        title: "Metabolic & Lifestyle Diseases",
        description: "Personalized management protocols for type 1 and type 2 diabetes mellitus, dyslipidemia, thyroid disorders, and obesity-related metabolic syndromes."
      },
      {
        title: "Cardiovascular Risk & Hypertension",
        description: "Early detection, secondary prevention, and pharmacotherapy for resistant hypertension, coronary risk factors, and peripheral vascular health."
      },
      {
        title: "Infectious Diseases & Tropical Fevers",
        description: "Evidence-based diagnostics and management for seasonal tropical infections, vector-borne diseases, pneumonia, urinary sepsis, and FUO (Fever of Unknown Origin)."
      },
      {
        title: "Geriatric & Multimorbidity Care",
        description: "Specialized clinical focus for elderly patients managing multiple concurrent health conditions with dedicated medication reconciliation."
      }
    ],
    procedures: [
      {
        name: "Comprehensive Adult Health Assessments",
        description: "Systematic physical exams, baseline blood chemistries, organ function monitoring, and risk stratification."
      },
      {
        name: "Continuous Glycemic Monitoring & Diabetes Care",
        description: "HbA1c monitoring, insulin titration regimes, and personalized lifestyle counseling."
      },
      {
        name: "Adult Immunization & Preventive Health",
        description: "Administering seasonal influenza, pneumococcal, hepatitis, and typhoid vaccinations for adult populations."
      },
      {
        name: "Inpatient Medical Sepsis & Fever Management",
        description: "Intravenous antibiotic protocols, blood cultures, hemodynamic stabilization, and round-the-clock vital tracking."
      }
    ],
    facilitiesAndTech: [
      "24/7 NABL-standard automated pathology laboratory for rapid blood chemistry",
      "Immediate bedside arterial blood gas (ABG) and cardiac biomarker testing",
      "High-dependency step-down medical units with continuous telemetry",
      "Integrated pharmacy with round-the-clock prescription fulfillment"
    ],
    whenToConsult: [
      "Unexplained persistent fever, fatigue, or significant involuntary weight loss",
      "Fluctuating or uncontrolled blood pressure and blood glucose levels",
      "Chronic digestive issues, recurrent chest or abdominal discomfort",
      "Complicated symptoms requiring diagnostic correlation across multiple bodily systems"
    ],
    faqs: [
      {
        question: "When should I see an internal medicine physician instead of a general practitioner?",
        answer: "Internal medicine physicians (internists) have advanced postgraduate training specifically dedicated to diagnosing complex adult diseases, multisystem conditions, and chronic metabolic illnesses."
      },
      {
        question: "Does the department handle sudden medical emergencies like severe infections?",
        answer: "Yes. Our internal medicine team works directly with our emergency room and ICU to provide prompt stabilization and targeted antimicrobial therapies for acute infections."
      },
      {
        question: "Can I get a full-body preventive health checkup arranged here?",
        answer: "Yes, our department coordinates tailored preventive health checkup packages including lab panels, radiological screenings, and physician consultations."
      }
    ]
  },

  "orthopaedic-surgery": {
    slug: "orthopaedic-surgery",
    name: "Orthopaedic Surgery",
    tagline: "Advanced bone, joint, and trauma care, fracture management, and joint reconstruction.",
    metaTitle: "Orthopaedic Surgeons & Trauma Care in Silchar",
    metaDescription:
      "Get expert bone, joint, and fracture care at South City Hospital in Silchar. Specializing in trauma surgery, joint reconstruction, and spine care.",
    overviewParagraphs: [
      "The Department of Orthopaedic Surgery at South City Hospital provides specialized clinical and surgical care for disorders of the musculoskeletal system. Our board-certified orthopaedic surgeons treat traumatic fractures, sports injuries, degenerative joint conditions, and spinal column disorders.",
      "With high-speed highway traffic and regional industrial activity in Southern Assam, rapid orthopaedic trauma intervention is vital. Our emergency trauma center operates 24/7 with laminar airflow operating suites and modern C-arm fluoroscopy imaging for immediate fracture reduction and internal fixation.",
      "We believe that successful orthopaedic treatment pairs surgical precision with early mobilization. Our physiotherapy and rehabilitation team works hand-in-hand with surgeons to help patients regain mobility, strength, and independence quickly."
    ],
    keySpecializations: [
      {
        title: "Complex Trauma & Fracture Fixation",
        description: "Surgical reconstruction for compound fractures, pelvic injuries, periarticular trauma, and non-union or mal-union bone corrections."
      },
      {
        title: "Joint Reconstruction & Arthropathy",
        description: "Comprehensive care for severe osteoarthritis and inflammatory joint diseases of the hip, knee, and shoulder joints."
      },
      {
        title: "Spine & Back Pain Care",
        description: "Conservative and surgical management for lumbar disc herniation, cervical spondylosis, spinal stenosis, and degenerative vertebral instability."
      },
      {
        title: "Sports Medicine & Ligament Care",
        description: "Diagnosis and restoration for acute meniscus tears, anterior cruciate ligament (ACL) strains, and shoulder rotator cuff tears."
      }
    ],
    procedures: [
      {
        name: "Open Reduction and Internal Fixation (ORIF)",
        description: "Anatomical bone alignment and stabilization using titanium plates, intramedullary nails, and dynamic screws under fluoroscopy."
      },
      {
        name: "Closed Fracture Reduction & Casting",
        description: "Non-surgical realignment and modern lightweight immobilization for stable fractures and pediatric limb injuries."
      },
      {
        name: "Intra-Articular Injections & Viscosupplementation",
        description: "Targeted joint injections to relieve chronic knee and shoulder pain in degenerative arthritis."
      },
      {
        name: "Post-Trauma Rehabilitation & Physiotherapy",
        description: "Guided gait retraining, electrotherapy, and muscle strengthening protocols for restored range of motion."
      }
    ],
    facilitiesAndTech: [
      "Ultra-clean Modular Operating Theatres equipped with HEPA filtration",
      "High-resolution C-Arm image intensifier for real-time intraoperative fluoroscopy",
      "Digital High-End X-Ray and multi-slice CT scanning for rapid bone imaging",
      "Dedicated inpatient orthopaedic recovery wing with specialized traction beds"
    ],
    whenToConsult: [
      "Severe pain, swelling, or deformity in an arm or leg following a fall or road accident",
      "Inability to bear weight on the knee, ankle, or hip",
      "Chronic joint stiffness or radiating pain down the back and legs",
      "Persistent sports injury that does not improve after rest and basic home care"
    ],
    faqs: [
      {
        question: "How fast can fracture patients be evaluated in an emergency?",
        answer: "Our emergency trauma room evaluates orthopaedic cases immediately upon arrival, with on-site digital X-rays and trauma surgeons on call 24 hours a day."
      },
      {
        question: "Is physical therapy available right after surgery?",
        answer: "Yes, our certified physical therapists begin gentle bedside mobilization as early as 24 hours post-procedure to prevent stiffness and deep vein thrombosis."
      },
      {
        question: "Are non-surgical treatment options considered first?",
        answer: "Whenever clinically indicated, our surgeons prioritize non-operative solutions including bracing, targeted injections, medications, and structured physical therapy."
      }
    ]
  },

  "neuro-surgery": {
    slug: "neuro-surgery",
    name: "Neuro Surgery",
    tagline: "Dedicated surgical care for brain trauma, spinal disorders, and peripheral nerve conditions.",
    metaTitle: "Neuro Surgery & Spine Specialists in Silchar",
    metaDescription:
      "Consult leading neurosurgeons at South City Hospital in Silchar. 24/7 emergency head trauma care, spinal disc surgeries, and advanced neuro-critical care.",
    overviewParagraphs: [
      "The Department of Neuro Surgery at South City Hospital delivers specialized neurosurgical and neuro-critical care for patients throughout Silchar, Cachar, and adjacent border regions. Brain and spinal injuries require immediate, hyper-accurate intervention where every minute directly affects neurological recovery.",
      "Our department is supported by a dedicated Neuro-Intensive Care Unit (Neuro ICU) equipped with continuous intracranial pressure (ICP) monitoring, neuro-ventilators, and round-the-clock neuro-trained nursing staff.",
      "From emergency decompressive craniectomies for acute subdural and epidural hematomas to elective microscopic spinal decompressive procedures, our surgical teams operate with microscopic instruments and precision protocols designed to protect delicate neurological function."
    ],
    keySpecializations: [
      {
        title: "Neurotrauma & Emergency Head Injuries",
        description: "Rapid trauma surgical intervention for skull fractures, brain contusions, extradural hematomas (EDH), and acute subdural hematomas (SDH)."
      },
      {
        title: "Spine Surgery & Disc Herniations",
        description: "Decompression and stabilization for cervical and lumbar disc prolapse, spondylolisthesis, and traumatic spinal cord compression."
      },
      {
        title: "Cerebrovascular & Stroke Intervention",
        description: "Critical medical and surgical management for hemorrhagic strokes, subarachnoid hemorrhages, and vascular malformations."
      },
      {
        title: "Hydrocephalus & CSF Disorders",
        description: "Ventriculoperitoneal (VP) shunt placement and revision procedures for normal pressure and obstructive hydrocephalus."
      }
    ],
    procedures: [
      {
        name: "Emergency Craniectomy and Hematoma Evacuation",
        description: "Surgical removal of intracranial blood clots to reduce life-threatening pressure within the cranial vault."
      },
      {
        name: "Microscopic Lumbar and Cervical Discectomy",
        description: "Targeted surgical removal of herniated disc fragments compressing spinal nerve roots."
      },
      {
        name: "Spinal Fixation and Fusion",
        description: "Pedicle screw instrumentation to restore structural spinal stability following trauma or severe degeneration."
      },
      {
        name: "Ventriculoperitoneal (VP) Shunting",
        description: "Surgical diversion of cerebrospinal fluid from the brain ventricles to relieve hydrocephalus."
      }
    ],
    facilitiesAndTech: [
      "Dedicated Neuro-ICU with invasive hemodynamic and intracranial pressure monitoring",
      "Multi-Slice CT Scanner for immediate emergent neuro-imaging on hospital grounds",
      "Operating microscope and micro-surgical neuro-instrumentation sets",
      "Electrophysiological diagnostic support including EEG and Nerve Conduction Velocity (NCV)"
    ],
    whenToConsult: [
      "Loss of consciousness, vomiting, or memory disorientation after a head bump or accident",
      "Sudden severe headache accompanied by neck stiffness or visual changes",
      "Progressive weakness, numbness, or tingling in the arms, hands, or legs",
      "Loss of bowel or bladder control accompanying acute severe lower back pain"
    ],
    faqs: [
      {
        question: "What should I do immediately if someone experiences a serious head injury?",
        answer: "Keep the patient still, avoid moving the neck, check breathing, and bring them straight to our 24/7 Emergency Department where a CT scan can be performed immediately."
      },
      {
        question: "Can back pain and sciatica be resolved without brain or spine surgery?",
        answer: "Yes, the vast majority of sciatica and disc cases resolve with medical management and physical therapy; surgery is reserved for severe nerve compression or weakness."
      },
      {
        question: "Does South City Hospital have ICU doctors on duty at night for brain trauma?",
        answer: "Yes, our intensive care units and trauma resuscitation teams are staffed on-site 24 hours a day, 365 days a year."
      }
    ]
  },

  "general-laparoscopic-surgery": {
    slug: "general-laparoscopic-surgery",
    name: "General & Laparoscopic Surgery",
    tagline: "Minimally invasive keyhole procedures and comprehensive general surgical treatments.",
    metaTitle: "General & Laparoscopic Surgeons in Silchar",
    metaDescription:
      "Consult experienced laparoscopic surgeons at South City Hospital in Silchar for keyhole gallbladder, hernia, appendix, and gastrointestinal surgeries.",
    overviewParagraphs: [
      "The Department of General & Laparoscopic Surgery at South City Hospital provides modern surgical solutions with an emphasis on minimally invasive techniques. Also known as 'keyhole surgery', laparoscopic procedures use tiny incisions, specialized video cameras, and fine micro-instruments.",
      "Minimally invasive surgery drastically reduces post-operative pain, lowers infection rates, minimizes cosmetic scarring, and enables patients to return to their normal daily activities within days instead of weeks.",
      "Our surgical theater suites adhere to strict sterile protocols and are staffed by experienced perioperative nurses, surgical technologists, and dedicated anesthesiologists to ensure safety from pre-operative check-in through complete healing."
    ],
    keySpecializations: [
      {
        title: "Laparoscopic Gallbladder & Biliary Surgery",
        description: "Keyhole removal of symptomatic gallbladders (cholecystectomy) for gallstones, acute cholecystitis, and biliary colic."
      },
      {
        title: "Advanced Hernia Repair",
        description: "Laparoscopic and open mesh hernioplasty for inguinal, umbilical, incisional, and femoral hernias."
      },
      {
        title: "Emergency Appendectomy",
        description: "Rapid laparoscopic removal of inflamed appendix to prevent perforation and peritonitis."
      },
      {
        title: "Benign & Soft Tissue Surgical Excision",
        description: "Excision of lipomas, sebaceous cysts, breast fibroadenomas, and superficial swellings under local or regional anesthesia."
      }
    ],
    procedures: [
      {
        name: "Laparoscopic Cholecystectomy",
        description: "Removal of the gallbladder through three to four small keyhole incisions with minimal tissue trauma."
      },
      {
        name: "Laparoscopic Hernioplasty (TEP/TAPP)",
        description: "Tension-free prosthetic mesh reinforcement of abdominal wall defects using laparoscopic access."
      },
      {
        name: "Laparoscopic Appendectomy",
        description: "Emergency minimally invasive extraction of the acute appendix."
      },
      {
        name: "Diagnostic Laparoscopy & Biopsy",
        description: "Direct visual inspection of the peritoneal cavity and organ biopsy for unexplained abdominal disease."
      }
    ],
    facilitiesAndTech: [
      "High-Definition (HD) Endovision Laparoscopic Camera Systems",
      "Advanced ultrasonic harmonic scalpel and electrosurgical energy platforms",
      "Fully equipped post-anesthesia care unit (PACU) with dedicated monitoring",
      "Modern day-care surgical beds for fast-track outpatient procedures"
    ],
    whenToConsult: [
      "Recurrent sharp pain in the upper right abdomen after consuming fatty meals",
      "A noticeable bulge or swelling in the groin or abdomen that becomes prominent when standing or coughing",
      "Sudden sharp lower right abdominal pain accompanied by nausea and fever",
      "Painful lumps, skin cysts, or non-healing skin abscesses requiring drainage"
    ],
    faqs: [
      {
        question: "How long is the typical hospital stay after laparoscopic gallbladder surgery?",
        answer: "Most laparoscopic cholecystectomy patients can be safely discharged within 24 to 48 hours following surgery."
      },
      {
        question: "Is laparoscopic surgery suitable for all types of hernias?",
        answer: "Most inguinal and ventral hernias are excellent candidates for laparoscopic repair; your surgeon will evaluate your condition to recommend the safest technique."
      },
      {
        question: "When can I resume work after keyhole surgery?",
        answer: "Most patients return to desk work and light activities within 5 to 7 days, avoiding heavy lifting for 3 to 4 weeks."
      }
    ]
  },

  "endoscopic-surgery": {
    slug: "endoscopic-surgery",
    name: "Endoscopic Surgery",
    tagline: "Diagnostic and therapeutic gastrointestinal endoscopy without open surgical incisions.",
    metaTitle: "Endoscopic Surgery & GI Diagnostics in Silchar",
    metaDescription:
      "Advanced GI endoscopy and colonoscopy at South City Hospital in Silchar. Safe diagnostic procedures, polyp removal, and ulcer treatments.",
    overviewParagraphs: [
      "The Department of Endoscopic Surgery at South City Hospital offers sophisticated diagnostic and therapeutic procedures for gastrointestinal conditions. By inserting flexible, lighted endoscopes fitted with high-definition video chips into the digestive tract, clinicians can directly examine mucosal surfaces without surgical incisions.",
      "Our endoscopy suite performs both upper gastrointestinal endoscopy (UGI endoscopy) and lower gastrointestinal evaluations (colonoscopy). These procedures are instrumental for diagnosing persistent acidity, gastric ulcers, gastrointestinal bleeding, Barrett's esophagus, and colorectal polyps.",
      "Procedures are performed under gentle conscious sedation or local anesthesia, ensuring complete comfort for the patient while enabling immediate therapeutic actions like biopsy sampling, foreign object retrieval, and polyp resection."
    ],
    keySpecializations: [
      {
        title: "Upper GI Diagnostic Endoscopy",
        description: "Visual evaluation of the esophagus, stomach, and duodenum for heartburn, dyspepsia, dysphagia, and ulcers."
      },
      {
        title: "Diagnostic & Screening Colonoscopy",
        description: "Comprehensive examination of the entire large intestine and rectum for polyps, bleeding, and inflammatory bowel disease."
      },
      {
        title: "Therapeutic Hemostasis",
        description: "Endoscopic control of active GI bleeding using hemoclips, electrocoagulation, and injection sclerotherapy."
      },
      {
        title: "Endoscopic Polypectomy",
        description: "Painless snaring and resection of precancerous polyps from the stomach and colon during diagnostic exams."
      }
    ],
    procedures: [
      {
        name: "Upper GI Gastroscopy",
        description: "Examination of upper digestive tract with mucosal biopsy testing for Helicobacter pylori infection."
      },
      {
        name: "Colonoscopy and Mucosal Resection",
        description: "Total colon visualization and removal of mucosal lesions or polyps."
      },
      {
        name: "Endoscopic Foreign Body Extraction",
        description: "Urgent retrieval of swallowed coins, bones, or impacted food boluses from the upper airway or esophagus."
      },
      {
        name: "Esophageal Stricture Dilatation",
        description: "Balloon dilatation of benign esophageal narrowing to restore normal swallowing."
      }
    ],
    facilitiesAndTech: [
      "High-Definition video endoscopes with narrow-band mucosal imaging capabilities",
      "Automated endoscope reprocessors with certified multi-stage chemical sterilization",
      "Dedicated comfortable recovery suite for post-sedation monitoring",
      "Fluoroscopic guidance integration for complex GI interventions"
    ],
    whenToConsult: [
      "Chronic severe acidity, burning in the chest, or regurgitation not responding to antacids",
      "Difficulty or pain while swallowing food or liquids (dysphagia)",
      "Unexplained blood in vomit or dark, black tarry bowel movements",
      "Chronic alternating diarrhea, constipation, or unexplained anemia in adults over 45"
    ],
    faqs: [
      {
        question: "Is endoscopy painful?",
        answer: "No. A local throat spray numbs the throat, and mild sedation ensures you remain relaxed and comfortable throughout the brief 10 to 15-minute procedure."
      },
      {
        question: "How should I prepare for an upper GI endoscopy?",
        answer: "Patients must avoid eating or drinking for at least 6 to 8 hours prior to the procedure so the stomach remains empty and clearly visible."
      },
      {
        question: "When are the endoscopy biopsy results available?",
        answer: "Initial visual findings are discussed immediately; tissue biopsy pathology reports are usually ready within 3 to 5 business days."
      }
    ]
  },

  "gynecology-and-obst": {
    slug: "gynecology-and-obst",
    name: "Gynecology and Obstetrics",
    tagline: "Dedicated women's health, maternity care, and gynecological surgical solutions.",
    metaTitle: "Gynecologists & Maternity Care in Silchar",
    metaDescription:
      "Compassionate gynecological and obstetric care at South City Hospital in Silchar. Prenatal monitoring, safe deliveries, and women's health surgeries.",
    overviewParagraphs: [
      "The Department of Gynecology and Obstetrics at South City Hospital is dedicated to the total health and well-being of women at every phase of life. From adolescent reproductive health and family planning to comprehensive prenatal care and post-menopausal support, our clinicians offer compassionate and evidence-based medicine.",
      "Our maternity services prioritize safety and clinical dignity for mothers and newborns. We manage both routine pregnancies and high-risk obstetric conditions, including gestational hypertension, pre-eclampsia, gestational diabetes, and multiple gestations.",
      "For gynecological disorders such as uterine fibroids, ovarian cysts, pelvic organ prolapse, and abnormal uterine bleeding, our surgeons provide modern medical therapies alongside minimally invasive laparoscopic and hysteroscopic surgeries."
    ],
    keySpecializations: [
      {
        title: "High-Risk Pregnancy Management",
        description: "Specialized monitoring and delivery protocols for maternal health issues, prior c-sections, and fetal growth restrictions."
      },
      {
        title: "Minimally Invasive Gynecological Surgery",
        description: "Laparoscopic cystectomies, myomectomies (fibroid removal), and hysterectomies with minimal discomfort."
      },
      {
        title: "Infertility & Reproductive Health",
        description: "Diagnostic ovulation tracking, hormonal evaluation, tubal patency assessments, and tailored fertility support."
      },
      {
        title: "Preventive Women's Oncology",
        description: "Routine Pap smears, HPV DNA screening, and clinical breast examinations for early cancer detection."
      }
    ],
    procedures: [
      {
        name: "Antenatal & Postnatal Care Regimens",
        description: "Scheduled pregnancy checkups, fetal heartbeat monitoring, nutritional guidance, and postpartum care."
      },
      {
        name: "Safe Normal & Caesarean Delivery Care",
        description: "Fully equipped delivery suites and round-the-clock emergency surgical theaters for safe childbirth."
      },
      {
        name: "Laparoscopic Hysterectomy & Myomectomy",
        description: "Surgical removal of diseased uterus or fibroids through miniature abdominal keyholes."
      },
      {
        name: "Colposcopy and Cervical Biopsy",
        description: "Magnified visual examination of the cervix for abnormal cellular changes and early intervention."
      }
    ],
    facilitiesAndTech: [
      "Modern labor and delivery suites with continuous fetal heart rate monitoring",
      "Immediate proximity to Neonatal Intensive Care (NICU) for newborn support",
      "High-resolution 3D/4D ultrasound for detailed fetal anomaly scans",
      "Dedicated, private recovery rooms designed for mother-infant bonding"
    ],
    whenToConsult: [
      "Irregular, extremely painful, or excessively heavy menstrual bleeding",
      "Confirmation of pregnancy or early pregnancy complications and spotting",
      "Pelvic pain, discomfort, or sensation of pelvic heaviness",
      "Planning a pregnancy or experiencing difficulty conceiving after 12 months"
    ],
    faqs: [
      {
        question: "Does South City Hospital handle high-risk pregnancies?",
        answer: "Yes, our obstetric team has extensive experience managing high-risk pregnancies, supported 24/7 by our intensive care units and pediatric specialists."
      },
      {
        question: "Can I choose laparoscopic surgery for fibroid removal?",
        answer: "Depending on the size, number, and location of the fibroids, laparoscopic myomectomy is frequently the preferred, minimally invasive choice."
      },
      {
        question: "At what age should women begin regular cervical screening?",
        answer: "Women should initiate routine cervical cancer screenings (Pap smears) starting at age 21, repeating them every 3 to 5 years as recommended by guidelines."
      }
    ]
  },

  "urology-laser-surgery": {
    slug: "urology-laser-surgery",
    name: "Urology & Laser Surgery",
    tagline: "Laser kidney stone removal, prostate care, and advanced urinary tract treatments.",
    metaTitle: "Urology & Laser Kidney Stone Specialists in Silchar",
    metaDescription:
      "Consult urologists at South City Hospital in Silchar for laser kidney stone removal (RIRS/URSL), prostate surgery (TURP), and urinary disorders.",
    overviewParagraphs: [
      "The Department of Urology & Laser Surgery at South City Hospital provides specialized clinical and surgical care for disorders of the male and female urinary tract, as well as the male reproductive system. We utilize modern holmium laser technology to deliver bloodless, scarless treatments for kidney stones and prostate enlargement.",
      "Kidney and ureteric stones are highly prevalent in the Barak Valley. Our center offers complete endourological solutions including Retrograde Intrarenal Surgery (RIRS) and Ureteroscopic Lithotripsy (URSL), pulverizing hard stones into fine dust without external skin incisions.",
      "Our urology unit also delivers thorough diagnostic workups and treatments for benign prostatic hyperplasia (BPH), urinary tract strictures, hematuria (blood in urine), and recurrent urinary infections."
    ],
    keySpecializations: [
      {
        title: "Laser Kidney Stone Management (RIRS & URSL)",
        description: "Minimally invasive laser fragmentation for stones located in the kidney, ureter, and bladder."
      },
      {
        title: "Prostate Health & Laser Surgery",
        description: "Comprehensive medical therapy and transurethral laser resection for enlarged prostate glands causing urinary blockage."
      },
      {
        title: "Urethral Stricture Reconstruction",
        description: "Endoscopic visual internal urethrotomy (VIU) and reconstructive urethroplasty for urinary flow obstruction."
      },
      {
        title: "Urological Oncology & Hematuria",
        description: "Diagnostic cystoscopy, biopsy, and surgical management for bladder, kidney, and prostate tumors."
      }
    ],
    procedures: [
      {
        name: "Retrograde Intrarenal Surgery (RIRS)",
        description: "Flexible endoscope navigated through natural urinary passages to laser-dust stones inside the kidney."
      },
      {
        name: "Ureteroscopic Lithotripsy (URSL)",
        description: "Endoscopic retrieval and laser breaking of ureteric stones causing severe flank pain."
      },
      {
        name: "Transurethral Resection of the Prostate (TURP)",
        description: "Endoscopic procedure to relieve urinary obstruction caused by an enlarged prostate."
      },
      {
        name: "Uroflowmetry Assessment",
        description: "Non-invasive electronic testing to analyze urine flow velocity and bladder emptying efficiency."
      }
    ],
    facilitiesAndTech: [
      "High-power Holium Laser generator for rapid stone lithotripsy",
      "Digital flexible and semi-rigid ureteroscopes and nephroscopes",
      "Computerized uroflowmetry laboratory for immediate diagnostic curves",
      "Fluoroscopic C-arm guidance in dedicated endourology theater"
    ],
    whenToConsult: [
      "Sudden, excruciating sharp pain in the lower back, flank, or groin",
      "Presence of visible blood in the urine (pink, red, or cola-colored)",
      "Difficulty starting urination, weak urine stream, or frequent nighttime waking to urinate",
      "Recurrent burning sensation or fever associated with urinary tract infections"
    ],
    faqs: [
      {
        question: "Does laser kidney stone surgery require any cuts or stitches?",
        answer: "No. Procedures like RIRS and URSL access the stone through natural urinary passages, meaning there are zero external cuts, stitches, or scars."
      },
      {
        question: "How quickly can I go home after laser kidney stone treatment?",
        answer: "Most patients are safely discharged within 24 to 36 hours and can resume light daily routines shortly thereafter."
      },
      {
        question: "How can I prevent kidney stones from recurring?",
        answer: "Drinking adequate water daily (2.5 to 3 liters), reducing excess dietary salt, and following personalized dietary advice based on stone analysis help prevent recurrence."
      }
    ]
  },

  "nephrology": {
    slug: "nephrology",
    name: "Nephrology",
    tagline: "Kidney disease management, hypertension care, and 24/7 continuous hemodialysis.",
    metaTitle: "Nephrologists & Dialysis Center in Silchar",
    metaDescription:
      "Expert renal care at South City Hospital in Silchar. 24/7 hemodialysis, chronic kidney disease (CKD) management, and renal hypertension treatment.",
    overviewParagraphs: [
      "The Department of Nephrology at South City Hospital specializes in preserving kidney health and treating acute and chronic renal diseases. Kidneys play a vital role in filtering waste products, balancing bodily fluids, and regulating blood pressure.",
      "Our nephrology service provides comprehensive care for Chronic Kidney Disease (CKD), Acute Kidney Injury (AKI), glomerulonephritis, and diabetic nephropathy. We focus heavily on early detection and medical slowing of renal disease progression.",
      "South City Hospital operates a state-of-the-art 24/7 Hemodialysis Unit with high-efficiency dialyzers, ultra-pure water treatment systems, and compassionate renal nurses to ensure safe, comfortable sessions for both outpatients and critically ill inpatients."
    ],
    keySpecializations: [
      {
        title: "Chronic Kidney Disease (CKD) Care",
        description: "Stage-specific medical management to protect remaining renal function, correct anemia, and control mineral-bone disease."
      },
      {
        title: "24/7 Hemodialysis Services",
        description: "Round-the-clock maintenance and emergency hemodialysis supported by advanced reverse osmosis (RO) water purification."
      },
      {
        title: "Diabetic & Hypertensive Nephropathy",
        description: "Targeted renoprotective therapies to halt kidney damage caused by long-standing diabetes and elevated blood pressure."
      },
      {
        title: "Glomerular & Autoimmune Renal Diseases",
        description: "Evaluation and immunosuppressive therapy for nephrotic syndrome, lupus nephritis, and acute glomerulonephritis."
      }
    ],
    procedures: [
      {
        name: "Maintenance Hemodialysis Sessions",
        description: "Gentle four-hour blood filtration sessions overseen by trained dialysis technicians and nephrologists."
      },
      {
        name: "Temporary & Tunneled Dialysis Catheter Insertion",
        description: "Bedside ultrasound-guided internal jugular or femoral catheter placement for acute dialysis vascular access."
      },
      {
        name: "Renal Biopsy Diagnostics",
        description: "Ultrasound-guided percutaneous kidney tissue sampling for precise microscopic disease staging."
      },
      {
        name: "Continuous Renal Replacement Support",
        description: "Bedside emergency dialysis protocols for hemodynamically unstable patients in our Intensive Care Unit."
      }
    ],
    facilitiesAndTech: [
      "Advanced multi-station Hemodialysis Unit with emergency power backup",
      "Hospital-grade automated Double-Pass Reverse Osmosis (RO) water plant",
      "Immediate electrolyte and blood gas analysis within 10 minutes",
      "Isolated dialysis machines dedicated for viral-screened patients"
    ],
    whenToConsult: [
      "Persistent swelling around the eyes, ankles, or feet (edema)",
      "Unexplained decline in urine output or frothy/foamy urine",
      "Elevated serum creatinine or blood urea nitrogen (BUN) on routine blood tests",
      "Longstanding uncontrolled diabetes or hypertension requiring kidney status check"
    ],
    faqs: [
      {
        question: "How often do chronic kidney disease patients need dialysis?",
        answer: "Patients with end-stage renal disease generally undergo hemodialysis two to three times per week, depending on residual kidney function and laboratory markers."
      },
      {
        question: "Can early-stage kidney disease be cured or reversed?",
        answer: "While chronic damage cannot always be fully reversed, early diagnosis and aggressive control of blood pressure and blood sugar can significantly slow or halt further progression."
      },
      {
        question: "Is dialysis available for emergency hospital admissions at night?",
        answer: "Yes, our dialysis team and nephrology on-call staff operate 24 hours a day to handle emergency renal failure and toxin clearances."
      }
    ]
  },

  "cardiology": {
    slug: "cardiology",
    name: "Interventional Cardiology",
    tagline: "Heart diagnostics, emergency cardiac care, echocardiography, and Holter monitoring.",
    metaTitle: "Cardiologists & Heart Care in Silchar",
    metaDescription:
      "Consult heart specialists at South City Hospital in Silchar. 24/7 cardiac emergency stabilization, 2D/3D Echo, ECG, and Holter monitoring.",
    overviewParagraphs: [
      "The Department of Cardiology at South City Hospital provides specialized cardiovascular evaluation and emergency heart care for the community of Silchar and the wider Barak Valley. Cardiovascular health is critical, and rapid medical intervention during cardiac emergencies saves lives.",
      "Our cardiology team provides advanced non-invasive cardiac diagnostics, including Color Doppler 2D/3D Echocardiography, continuous 24-hour Holter monitoring, resting electrocardiograms, and cardiac enzyme biomarker testing.",
      "Supported by our Coronary Care Unit (CCU), our cardiologists manage acute coronary syndromes, myocardial infarction (heart attack) stabilization, congestive heart failure, arrhythmias, and hypertensive emergencies around the clock."
    ],
    keySpecializations: [
      {
        title: "Emergency Cardiac Care & CCU",
        description: "Immediate triage, pharmacological thrombolysis, and hemodynamic stabilization for acute heart attack patients."
      },
      {
        title: "Heart Failure Management",
        description: "Multi-drug therapy, fluid balance management, and lifestyle guidance to strengthen failing heart muscle."
      },
      {
        title: "Cardiac Arrhythmia Evaluation",
        description: "Investigating palpitations, skipped beats, and fainting spells using continuous wearable Holter monitors."
      },
      {
        title: "Hypertension & Preventive Cardiology",
        description: "Cardiovascular risk factor profiling, arterial stiffness assessments, and targeted cholesterol-lowering therapies."
      }
    ],
    procedures: [
      {
        name: "Color Doppler 2D/3D Echocardiography",
        description: "High-resolution ultrasound imaging to inspect heart chamber dimensions, valve movements, and ejection fraction."
      },
      {
        name: "24-Hour Continuous Holter ECG Monitoring",
        description: "Compact ambulatory recording device to detect transient rhythm disturbances throughout normal daily routines."
      },
      {
        name: "Cardiac Biomarker Screening",
        description: "Rapid quantitative Troponin-I and CK-MB laboratory testing for acute myocardial damage confirmation."
      },
      {
        name: "Emergency Defibrillation & Cardioversion",
        description: "Electrical therapy to restore normal sinus rhythm in patients experiencing life-threatening tachyarrhythmias."
      }
    ],
    facilitiesAndTech: [
      "Dedicated Coronary Care Unit (CCU) with invasive arterial line monitoring",
      "High-end GE Color Doppler Echocardiography ultrasound machines",
      "Digital 12-channel high-speed electrocardiography stations",
      "Advanced multiparameter bedside monitors with automatic arrhythmia alert algorithms"
    ],
    whenToConsult: [
      "Chest tightness, pressure, or crushing pain radiating to the jaw, neck, or left arm",
      "Sudden shortness of breath, particularly when lying flat or during minor exertion",
      "Persistent rapid heartbeats, fluttering palpitations, or unexpected fainting episodes",
      "Uncontrolled high blood pressure combined with family history of early heart disease"
    ],
    faqs: [
      {
        question: "What should I do if I suspect someone is having a heart attack?",
        answer: "Bring the patient immediately to South City Hospital's 24/7 Emergency Room. Do not wait for symptoms to subside, as immediate medical stabilization prevents heart muscle necrosis."
      },
      {
        question: "How does an Echocardiogram differ from an ECG?",
        answer: "An ECG records the heart's electrical rhythm, while an Echocardiogram is an ultrasound that visually shows the physical heart structure, pumping strength, and heart valve function."
      },
      {
        question: "Is hospital admission always necessary for chest pain?",
        answer: "Our doctors perform immediate ECG and cardiac blood tests to differentiate benign muscular discomfort from cardiac ischemia; only those requiring medical stabilization are admitted."
      }
    ]
  },

  "plastic-surgery": {
    slug: "plastic-surgery",
    name: "Plastic Surgery",
    tagline: "Reconstructive surgery, trauma soft tissue repairs, burn care, and scar revision.",
    metaTitle: "Plastic & Reconstructive Surgeons in Silchar",
    metaDescription:
      "Consult plastic surgeons at South City Hospital in Silchar for trauma soft-tissue reconstruction, burn management, skin grafts, and scar revisions.",
    overviewParagraphs: [
      "The Department of Plastic & Reconstructive Surgery at South City Hospital is dedicated to restoring both form and function. Whether caused by road traffic collisions, burn injuries, congenital anomalies, or post-surgical defects, our plastic surgeons employ fine microsurgical techniques to reconstruct damaged tissues.",
      "Accidental trauma frequently leaves severe soft-tissue loss, exposed bone, and tendon injuries. Our reconstructive team performs emergency wound debridement, rotational and free tissue flaps, and skin grafting to preserve limbs and maximize functional recovery.",
      "In addition to trauma reconstructive surgery, our department provides elective scar revision, contracture release for post-burn limitations, and cosmetic corrections tailored to each patient's individual goals."
    ],
    keySpecializations: [
      {
        title: "Trauma Soft Tissue Reconstruction",
        description: "Local, regional, and distant flap surgeries to cover exposed bones, joints, and tendons following accidents."
      },
      {
        title: "Burn Injury Management & Skin Grafting",
        description: "Acute burn resuscitation, biological dressings, split-thickness skin grafts, and post-burn contracture releases."
      },
      {
        title: "Hand & Tendon Surgery",
        description: "Reconstruction of cut nerves, flexor and extensor tendons, and digital fractures in the upper extremity."
      },
      {
        title: "Facial Trauma & Scar Revision",
        description: "Meticulous aesthetic closure of facial lacerations and surgical revision of hypertrophic scars."
      }
    ],
    procedures: [
      {
        name: "Split & Full-Thickness Skin Grafting",
        description: "Transplanting healthy skin layers to close extensive open wounds or deep burn injuries."
      },
      {
        name: "Local & Pedicled Flap Reconstruction",
        description: "Mobilizing adjacent healthy vascularized tissue to seal complex deep defects."
      },
      {
        name: "Tendon & Peripheral Nerve Repair",
        description: "Fine microsurgical suturing to restore motor function and sensation to injured extremities."
      },
      {
        name: "Keloid & Hypertrophic Scar Management",
        description: "Combined surgical excision, intralesional steroid therapy, and silicone pressure therapy."
      }
    ],
    facilitiesAndTech: [
      "High-precision surgical loupes and micro-instruments for delicate tissue handling",
      "Dedicated clean burn management beds with strict barrier nursing protocols",
      "Advanced electrocautery and bipolar coagulation systems",
      "Dermatome equipment for uniform, calibrated skin graft harvesting"
    ],
    whenToConsult: [
      "Extensive open skin and muscle wounds resulting from vehicular accidents or machine trauma",
      "Deep thermal or chemical burn wounds requiring professional medical debridement",
      "Restricted movement in the fingers, neck, or limbs caused by tight post-healing scar tissue",
      "Prominent or painful facial scars that you wish to cosmetically improve"
    ],
    faqs: [
      {
        question: "Does plastic surgery only involve cosmetic appearances?",
        answer: "No. The majority of plastic surgery at South City Hospital is reconstructive—restoring bodily function, repairing trauma injuries, and helping burn survivors regain mobility."
      },
      {
        question: "What is the recovery period following a skin graft?",
        answer: "Skin grafts generally take 7 to 14 days to bond and adhere firmly to the wound bed, followed by progressive scar therapy and physical rehabilitation."
      },
      {
        question: "Can burn contractures from several years ago still be corrected?",
        answer: "Yes, reconstructive surgical release with Z-plasties and skin grafting can significantly restore range of motion even years after the initial burn."
      }
    ]
  },

  "paediatrics": {
    slug: "paediatrics",
    name: "Paediatrics",
    tagline: "Comprehensive medical care for newborns, infants, children, and adolescents.",
    metaTitle: "Pediatricians & Child Healthcare in Silchar",
    metaDescription:
      "Consult child specialists at South City Hospital in Silchar. Routine vaccinations, newborn care, pediatric illnesses, and emergency care.",
    overviewParagraphs: [
      "The Department of Paediatrics at South City Hospital provides compassionate, family-centered medical care for infants, children, and young adolescents up to age 18. We understand that children are not just small adults—their developing physiology demands specialized medical insight and gentle clinical handling.",
      "Our pediatricians provide routine developmental surveillance, childhood immunization schedules, nutritional advice, and comprehensive management for acute pediatric illnesses like respiratory infections, gastroenteritis, childhood asthma, and viral fevers.",
      "The department is supported by trained pediatric nurses and high-dependency monitoring facilities, ensuring that critically unwell children receive attentive clinical supervision in a reassuring, kid-friendly environment."
    ],
    keySpecializations: [
      {
        title: "Newborn & Infant Healthcare",
        description: "Routine neonate assessments, neonatal jaundice phototherapy, breastfeeding support, and weight tracking."
      },
      {
        title: "National & Optional Immunization",
        description: "Complete vaccination schedules adhering to Indian Academy of Pediatrics (IAP) recommendations."
      },
      {
        title: "Pediatric Respiratory Care",
        description: "Diagnosis and nebulized therapies for childhood asthma, bronchiolitis, croup, and seasonal chest infections."
      },
      {
        title: "Growth & Nutritional Counseling",
        description: "Monitoring developmental milestones, addressing failure to thrive, micronutrient deficiencies, and childhood allergies."
      }
    ],
    procedures: [
      {
        name: "Routine Well-Child Developmental Checkups",
        description: "Systematic head-to-toe examinations, growth percentiles tracking, and developmental milestone screening."
      },
      {
        name: "Pediatric Emergency Resuscitation",
        description: "Rapid treatment for high febrile seizures, severe dehydration, respiratory distress, and anaphylaxis."
      },
      {
        name: "Phototherapy for Neonatal Jaundice",
        description: "Safe LED phototherapy units with eye shield protection to reduce newborn bilirubin levels."
      },
      {
        name: "Nebulization and Inhalation Therapy",
        description: "Gentle bronchodilator delivery for pediatric wheezing and acute bronchospasm."
      }
    ],
    facilitiesAndTech: [
      "Child-friendly examination rooms designed to alleviate healthcare anxiety",
      "Neonatal warming units and high-intensity LED phototherapy systems",
      "Pediatric-specific medication dosage formulation protocols",
      "24/7 emergency stabilization equipped with pediatric-sized airway instruments"
    ],
    whenToConsult: [
      "High persistent fever or febrile convulsions in an infant or toddler",
      "Rapid breathing, grunting sounds, or chest retractions when breathing",
      "Severe vomiting, persistent diarrhea, and signs of dehydration like sunken eyes or lethargy",
      "Noticeable delays in speaking, walking, or reaching typical physical milestones"
    ],
    faqs: [
      {
        question: "Are routine vaccines always in stock at the hospital?",
        answer: "Yes, our pediatric clinic maintains a cold-chain verified supply of all mandatory and optional IAP-recommended childhood vaccines."
      },
      {
        question: "What should I do if my child has a high fever and has a seizure?",
        answer: "Keep your child on their side, do not put anything in their mouth, loosen tight clothing, and bring them straight to our Emergency Department for immediate evaluation."
      },
      {
        question: "Can I consult a pediatrician for childhood behavioral and feeding issues?",
        answer: "Yes, our pediatric doctors regularly advise parents on infant weaning, picky eating, sleep habits, and behavioral milestones."
      }
    ]
  },

  "anaesthesiology": {
    slug: "anaesthesiology",
    name: "Anaesthesiology",
    tagline: "Expert perioperative care, surgical anesthesia, pain relief, and intensive life support.",
    metaTitle: "Anaesthesiology & Pain Management in Silchar",
    metaDescription:
      "Safe surgical anesthesia and perioperative care at South City Hospital in Silchar. General, regional, and acute pain management services.",
    overviewParagraphs: [
      "The Department of Anaesthesiology at South City Hospital is committed to ensuring patient safety, comfort, and pain-free experiences before, during, and after surgical interventions. Anaesthesiologists are critical guardians of human vital organs during complex operations.",
      "Before any surgical procedure, our team conducts meticulous Pre-Anesthetic Checkups (PAC) to assess cardiovascular health, airway anatomy, medication histories, and baseline laboratory parameters, customizing the safest anesthetic approach for every individual.",
      "During surgery, our anesthesiologists monitor vital organ parameters millisecond by millisecond. Post-operatively, they oversee the Post-Anesthesia Care Unit (PACU) and provide acute pain relief to ensure a comfortable and speedy transition to the recovery ward."
    ],
    keySpecializations: [
      {
        title: "Pre-Anesthetic Risk Evaluation (PAC)",
        description: "Comprehensive medical risk assessments and physical optimization before elective surgical procedures."
      },
      {
        title: "General & Balanced Anesthesia",
        description: "State-of-the-art intravenous and inhalation anesthesia with advanced airway management and muscle relaxation."
      },
      {
        title: "Regional & Neuroaxial Anesthesia",
        description: "Ultrasound-guided nerve blocks, spinal anesthesia, and epidural blocks for targeted limb and abdominal surgeries."
      },
      {
        title: "Acute & Post-Surgical Pain Management",
        description: "Patient-controlled analgesia (PCA) and multi-modal pain protocols to prevent post-operative suffering."
      }
    ],
    procedures: [
      {
        name: "General Anesthesia Induction and Airway Management",
        description: "Controlled reversible unconsciousness with endotracheal intubation or laryngeal mask airways."
      },
      {
        name: "Spinal & Epidural Anesthesia",
        description: "Administering local anesthetics into the subarachnoid or epidural space for pain-free lower-body surgery."
      },
      {
        name: "Ultrasound-Guided Peripheral Nerve Blocks",
        description: "Pinpoint anesthetic delivery around specific nerve bundles for shoulder, arm, or leg surgeries."
      },
      {
        name: "Critical Care Resuscitation & Central Line Placement",
        description: "Ultrasound-assisted vascular cannulation and hemodynamic stabilization in critical situations."
      }
    ],
    facilitiesAndTech: [
      "Modern anesthesia workstations with integrated circle breathing systems and vaporizers",
      "Continuous multiparameter monitoring (ECG, pulse oximetry, capnography, and invasive pressures)",
      "High-resolution portable ultrasound for regional nerve visualization",
      "Dedicated Post-Anesthesia Care Unit (PACU) with 1:1 nurse-to-patient oversight"
    ],
    whenToConsult: [
      "Scheduled for an upcoming elective surgery requiring a Pre-Anesthetic Checkup (PAC)",
      "History of previous adverse reactions or allergies to anesthetics or muscle relaxants",
      "Managing severe acute post-surgical pain requiring multimodal analgesia adjustments",
      "Chronic musculoskeletal pain syndromes requiring consultation with pain specialists"
    ],
    faqs: [
      {
        question: "Why do I need to fast before receiving anesthesia?",
        answer: "Fasting prevents food or liquids in the stomach from accidentally regurgitating and entering the lungs (aspiration) while your protective reflexes are sedated."
      },
      {
        question: "What is the difference between general and regional anesthesia?",
        answer: "General anesthesia puts you completely to sleep, while regional anesthesia numbs only the specific part of your body being operated on while you remain relaxed or lightly sedated."
      },
      {
        question: "Who monitors me while I am asleep during surgery?",
        answer: "A certified anesthesiologist remains physically at your bedside every single second of the operation, continuously tracking your heart rate, oxygen, blood pressure, and breathing."
      }
    ]
  },

  "oncology": {
    slug: "oncology",
    name: "Oncology",
    tagline: "Cancer diagnosis, multidisciplinary staging, chemotherapy services, and supportive care.",
    metaTitle: "Oncology & Cancer Care Specialists in Silchar",
    metaDescription:
      "Compassionate cancer care at South City Hospital in Silchar. Diagnostic staging, outpatient chemotherapy, tumor board consultations, and palliative care.",
    overviewParagraphs: [
      "The Department of Oncology at South City Hospital provides compassionate, comprehensive cancer diagnosis, staging, and therapeutic management. A cancer diagnosis is a life-altering experience, and our mission is to provide patients with clarity, hope, and cutting-edge evidence-based clinical treatments.",
      "We emphasize a multidisciplinary approach where oncologists, surgical specialists, diagnostic radiologists, and pathologists collaboratively evaluate patient profiles to establish personalized treatment strategies for solid tumors and hematological malignancies.",
      "Our department is equipped with a dedicated Daycare Chemotherapy Unit staffed by oncology-trained nurses, providing safe administration of targeted therapies, cytotoxic chemotherapeutic regimens, immunotherapy, and proactive management of treatment-related side effects."
    ],
    keySpecializations: [
      {
        title: "Comprehensive Cancer Screening & Staging",
        description: "Early detection protocols, tissue biopsy correlation, and anatomical staging using multi-slice CT and pathology."
      },
      {
        title: "Medical Oncology & Chemotherapy",
        description: "Administering adjuvant, neo-adjuvant, and palliative systemic cancer medications with strict biological safety."
      },
      {
        title: "Tumor Board Multidisciplinary Review",
        description: "Cross-specialty case conferences to determine the most effective combination of surgery, systemic therapy, and supportive care."
      },
      {
        title: "Palliative & Supportive Oncology",
        description: "Aggressive cancer pain management, nutritional support, and symptom relief to enhance daily quality of life."
      }
    ],
    procedures: [
      {
        name: "Outpatient Daycare Chemotherapy Infusions",
        description: "Administering intravenous cancer regimens in a comfortable environment with anti-emetic prophylaxis."
      },
      {
        name: "Image-Guided Diagnostic Tumor Biopsies",
        description: "Precision tissue extraction from suspicious lumps or lesions for definitive histopathological diagnosis."
      },
      {
        name: "Chemo Port Access & Maintenance",
        description: "Sterile flushing and needle access for long-term central venous chemotherapeutic access ports."
      },
      {
        name: "Cancer Pain and Palliative Management",
        description: "Tailored medication regimens following the WHO pain ladder to ensure dignity and pain-free living."
      }
    ],
    facilitiesAndTech: [
      "Dedicated Daycare Chemotherapy Lounge with comfortable reclining infusion chairs",
      "Biological safety hoods for sterile cytotoxic drug reconstitution",
      "NABL-standard pathology laboratory for rapid blood count checks before chemo",
      "Multidisciplinary tumor board conference facility for complex case discussions"
    ],
    whenToConsult: [
      "Unexplained, painless growing lump in the breast, neck, armpit, or groin",
      "Rapid unexplained weight loss, chronic fatigue, or prolonged low-grade fevers",
      "Persistent non-healing sores, noticeable changes in skin moles, or unusual bleeding",
      "Seeking a comprehensive second opinion on an existing biopsy or cancer diagnosis"
    ],
    faqs: [
      {
        question: "Can chemotherapy be administered as an outpatient without overnight admission?",
        answer: "Yes, the vast majority of chemotherapy protocols are delivered in our Daycare Chemotherapy Unit, allowing patients to return home the very same day."
      },
      {
        question: "How do you manage chemotherapy side effects like nausea and hair loss?",
        answer: "Modern pre-medications including advanced anti-emetics drastically curb nausea; our team guides patients through personalized care plans for every stage of treatment."
      },
      {
        question: "What is a Tumor Board consultation?",
        answer: "A Tumor Board is a clinical meeting where medical oncologists, surgeons, and radiologists examine all patient reports together to formulate the optimal treatment consensus."
      }
    ]
  }
};
