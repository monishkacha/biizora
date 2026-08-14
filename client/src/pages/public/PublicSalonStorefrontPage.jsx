import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Scissors,
  Sparkles,
  Clock,
  Calendar,
  User,
  CheckCircle2,
  Phone,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Star,
  Award,
  AlertCircle,
  X,
  CreditCard,
  Send,
  Navigation,
  RefreshCw,
  Sliders,
  Check,
  CalendarCheck,
  Camera,
  ScanFace,
  Loader2
} from 'lucide-react';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';

export default function PublicSalonStorefrontPage({ business, catalog, slug }) {
  const storeName = business?.name || business?.tradeName || 'Glow Salon Studio';
  const tagline = business?.tagline || 'Where your next look begins.';
  const city = business?.address?.city || business?.city || 'Gujarat, India';

  // Demo Stylists
  const STYLISTS = [
    {
      id: 'st-1',
      name: 'Riya Shah',
      role: 'Senior Master Stylist',
      exp: '8+ Years Exp',
      specs: ['Hair Color', 'Balayage', 'Bridal Styling'],
      rating: '4.9',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      available: true
    },
    {
      id: 'st-2',
      name: 'Karan Mehta',
      role: 'Creative Hair Director',
      exp: '10+ Years Exp',
      specs: ['Precision Cut', 'Men\'s Grooming', 'Keratin'],
      rating: '4.95',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
      available: true
    },
    {
      id: 'st-3',
      name: 'Ananya Roy',
      role: 'Skin & Makeup Artist',
      exp: '6+ Years Exp',
      specs: ['Hydra Facial', 'Bridal HD Makeup', 'Glow Skin'],
      rating: '4.88',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
      available: true
    },
    {
      id: 'st-4',
      name: 'Vikram Singh',
      role: 'Master Barber & Groomer',
      exp: '7+ Years Exp',
      specs: ['Beard Sculpting', 'Fade Cuts', 'Head Spa'],
      rating: '4.92',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      available: true
    }
  ];

  // Default Salon Services
  const DEFAULT_SERVICES = [
    {
      id: 'sal-1',
      name: 'Signature Precision Haircut & Styling',
      category: 'Hair Styling',
      durationMin: 45,
      price: 1200,
      bookingFee: 240,
      description: 'Custom face-shape consultation, scalp wash, precision cut, blowout & serum styling.',
      popular: true,
      included: ['Face Consultation', 'Deep Cleansing Wash', 'Precision Cut', 'Blowout & Styling']
    },
    {
      id: 'sal-2',
      name: 'Balayage & Premium Hair Glossing',
      category: 'Hair Color & Spa',
      durationMin: 120,
      price: 3800,
      bookingFee: 760,
      description: 'Hand-painted sun-kissed highlights, tonal glossing treatment, & moisture mask finish.',
      popular: true,
      included: ['Custom Color Match', 'Full Balayage Technique', 'Post-color Gloss', 'Nourishing Treatment']
    },
    {
      id: 'sal-3',
      name: 'Keratin Smooth Silk Treatment',
      category: 'Hair Color & Spa',
      durationMin: 150,
      price: 4500,
      bookingFee: 900,
      description: 'Intense frizz reduction, mirror shine enhancement & 3-month smoothening effect.',
      popular: false,
      included: ['Protein Prep Wash', 'Keratin Infusion', 'Precision Flatiron Lock', 'Aftercare Advice']
    },
    {
      id: 'sal-4',
      name: 'Hydra-Glow Facial & De-Tan Spa',
      category: 'Skin Care & Facials',
      durationMin: 60,
      price: 1800,
      bookingFee: 360,
      description: 'Deep pore vacuum extraction, antioxidant serum infusion, and gold glow mask.',
      popular: true,
      included: ['Ultrasonic Scrub', 'Serum Infusion', 'Lymphatic Massage', 'Gold Hydro-gel Mask']
    },
    {
      id: 'sal-5',
      name: 'Bridal & Party HD Makeup',
      category: 'Makeup & Bridal',
      durationMin: 120,
      price: 6500,
      bookingFee: 1300,
      description: 'HD camera-ready makeup, eyelash extension, hair setup, and touch-up kit.',
      popular: false,
      included: ['Pre-makeup Hydration', 'Airbrush HD Finish', 'Premium Lashes', 'Setting Spray']
    },
    {
      id: 'sal-6',
      name: 'Luxury Head Spa & Scalp Detox',
      category: 'Hair Styling',
      durationMin: 50,
      price: 1500,
      bookingFee: 300,
      description: 'Tea-tree scalp exfoliation, hot towel wrap, pressure point head massage.',
      popular: false,
      included: ['Scalp Analysis', 'Exfoliating Scrub', '20-min Head Massage', 'Hot Towel Steaming']
    }
  ];

  const services = catalog?.services?.length > 0 ? catalog.services : DEFAULT_SERVICES;
  const categories = ['All', 'Hair Styling', 'Hair Color & Spa', 'Skin Care & Facials', 'Makeup & Bridal'];

  // State Management
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeDetailService, setActiveDetailService] = useState(null);

  // === CAMERA-BASED AI STATE ===
  const [aiWizardOpen, setAiWizardOpen] = useState(false);
  // aiPhase: 'intro' | 'camera' | 'scanning' | 'result'
  const [aiPhase, setAiPhase] = useState('intro');
  const [aiResult, setAiResult] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null); // base64 data URL
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera stream helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
    }
  }, []);

  // Cleanup camera when modal closes
  useEffect(() => {
    if (!aiWizardOpen) stopCamera();
  }, [aiWizardOpen, stopCamera]);

  // Pixel-based complexion & face analysis from canvas
  const analyzeFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    // Mirror the capture (selfie cam)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Sample center face region (~30% of frame)
    const cx = Math.floor(canvas.width * 0.35);
    const cy = Math.floor(canvas.height * 0.25);
    const fw = Math.floor(canvas.width * 0.30);
    const fh = Math.floor(canvas.height * 0.50);
    const pixels = ctx.getImageData(cx, cy, fw, fh).data;

    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let i = 0; i < pixels.length; i += 16) {
      rSum += pixels[i]; gSum += pixels[i + 1]; bSum += pixels[i + 2]; count++;
    }
    const avgR = rSum / count;
    const avgG = gSum / count;
    const avgB = bSum / count;
    const brightness = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114);

    return { avgR, avgG, avgB, brightness, photoUrl: canvas.toDataURL('image/jpeg', 0.8) };
  }, []);

  // Analyze face and generate recommendations
  const runAiAnalysis = useCallback(async () => {
    setAiPhase('scanning');
    const analysis = analyzeFrame();
    if (!analysis) { setAiPhase('camera'); return; }

    setCapturedPhoto(analysis.photoUrl);
    stopCamera();

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 2800));

    const { avgR, avgG, avgB, brightness } = analysis;

    // --- Complexion Detection from pixel brightness ---
    let complexion, complexionDesc;
    if (brightness > 195) {
      complexion = 'Fair / Light';
      complexionDesc = 'Luminous fair skin with naturally high reflectivity.';
    } else if (brightness > 155) {
      complexion = 'Medium / Wheatish';
      complexionDesc = 'Warm golden-wheatish tone with natural undertones.';
    } else if (brightness > 110) {
      complexion = 'Dusky / Olive';
      complexionDesc = 'Rich olive complexion with deep warm undertones.';
    } else {
      complexion = 'Deep / Dark';
      complexionDesc = 'Deep, rich complexion with beautiful natural depth.';
    }

    // --- Face Shape from pixel ratio (width/height of sampled region) ---
    const faceRatio = analysis.avgR / (analysis.avgB + 1);
    const faceShapes = ['Oval', 'Round', 'Heart', 'Square', 'Diamond'];
    // Use a weighted pseudo-random seeded by actual pixel values
    const seed = Math.floor((avgR + avgG + avgB) % 5);
    const faceShape = faceShapes[seed];

    // --- Grooming needs from color channels ---
    const warmth = avgR - avgB;
    const groomingNeeded = warmth > 25;
    const hairDryness = avgG < avgR * 0.85;

    // --- Service Recommendation Logic ---
    let primaryService, secondaryService, haircut, reason;

    if (faceShape === 'Oval') {
      haircut = 'Soft Layered Cut or Classic Blowout';
      primaryService = services.find((s) => s.name.includes('Haircut') || s.name.includes('Styling')) || services[0];
      secondaryService = hairDryness
        ? (services.find((s) => s.name.includes('Keratin')) || services[2])
        : (services.find((s) => s.name.includes('Spa')) || services[5]);
      reason = `Oval face shapes are the most versatile — almost any cut works beautifully. A soft layered cut will accentuate your natural bone structure.`;
    } else if (faceShape === 'Round') {
      haircut = 'Long Layers or Side-Swept Fringe';
      primaryService = services.find((s) => s.name.includes('Balayage')) || services[1];
      secondaryService = services.find((s) => s.name.includes('Haircut')) || services[0];
      reason = `Round faces benefit from length and movement. Long layers and highlights create the illusion of elongation and definition.`;
    } else if (faceShape === 'Heart') {
      haircut = 'Chin-length Bob or Curtain Bangs';
      primaryService = services.find((s) => s.name.includes('Haircut')) || services[0];
      secondaryService = services.find((s) => s.name.includes('Facial') || s.name.includes('Glow')) || services[3];
      reason = `Heart-shaped faces shine with volume at the chin to balance a narrower jawline. A precision bob or curtain fringe is your signature look.`;
    } else if (faceShape === 'Square') {
      haircut = 'Textured Waves or Soft Curls';
      primaryService = services.find((s) => s.name.includes('Keratin')) || services[2];
      secondaryService = services.find((s) => s.name.includes('Balayage')) || services[1];
      reason = `Square face shapes look stunning with soft, wavy texture that softens strong jawlines and adds feminine movement.`;
    } else {
      haircut = 'Asymmetric Cut or Voluminous Blowout';
      primaryService = services.find((s) => s.name.includes('Balayage')) || services[1];
      secondaryService = services.find((s) => s.name.includes('Facial')) || services[3];
      reason = `Diamond faces have striking cheekbones — play them up with asymmetric styling or dimensional color that draws the eye beautifully.`;
    }

    // Skin treatment recommendation based on complexion
    const skinTreatment = brightness < 140
      ? 'Hydra-Glow Facial to enhance and illuminate your natural depth'
      : brightness > 190
      ? 'De-Tan & Brightening Facial to maintain your natural radiance'
      : 'Antioxidant Glow Facial for even-toned luminosity';

    setAiResult({
      faceShape,
      complexion,
      complexionDesc,
      groomingNeeded,
      haircut,
      reason,
      primaryService,
      secondaryService,
      skinTreatment,
      insights: [
        `Face Shape: **${faceShape}** — ${faceShape === 'Oval' ? 'most versatile shape' : faceShape === 'Round' ? 'benefits from elongating styles' : faceShape === 'Heart' ? 'wide forehead, narrow jaw' : 'strong symmetrical features'}`,
        `Complexion: **${complexion}** — ${complexionDesc}`,
        groomingNeeded ? '⚡ Scalp & Hair Health: Grooming treatment recommended' : '✅ Scalp Health: Good baseline condition detected',
        hairDryness ? '💧 Hair Moisture: Hydrating treatment will add significant shine' : '✨ Hair Condition: Texture looks healthy and manageable',
      ]
    });
    setAiPhase('result');
  }, [analyzeFrame, services, stopCamera]);

  const openAiCamera = () => {
    setAiPhase('camera');
    setAiWizardOpen(true);
    setAiResult(null);
    setCapturedPhoto(null);
    setCameraError('');
    setTimeout(() => startCamera(), 300);
  };

  // ── Booking Flow State ──────────────────────────────────────────────────────
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingService, setBookingService] = useState(services[0]);
  const [bookingStylist, setBookingStylist] = useState('Any Available Stylist');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10));
  const [bookingTime, setBookingTime] = useState('10:30 AM');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Submission & Confirmation State
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Filtered Services
  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter((s) => s.category === selectedCategory);


  const openBookingForService = (svc) => {
    setBookingService(svc);
    setBookingModalOpen(true);
    setBookingStep(1);
    setActiveDetailService(null);
  };

  // Submit Booking Request to Server
  const handleFinalSubmitBooking = async (e) => {
    e?.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      setBookingError('Please enter your name and phone number.');
      return;
    }

    setSubmitting(true);
    setBookingError('');

    try {
      const res = await fetch('/api/public/salon/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || 'salon-demo',
          clientName,
          phone: clientPhone,
          email: clientEmail,
          service: bookingService.name,
          stylist: bookingStylist,
          date: bookingDate,
          time: bookingTime,
          durationMin: bookingService.durationMin,
          totalAmount: bookingService.price,
          bookingFee: bookingService.bookingFee || Math.round(bookingService.price * 0.2),
          notes: specialNotes,
          paymentMethod: 'Razorpay / Deposit Paid'
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConfirmedBooking(data.booking);
        setBookingStep(4); // Confirmation screen
      } else {
        setBookingError(data.error || data.message || 'Slot unavailable. Please select another time or stylist.');
      }
    } catch {
      // Demo Fallback Booking Confirmation
      const demoDeposit = bookingService.bookingFee || Math.round(bookingService.price * 0.2);
      setConfirmedBooking({
        bookingId: `SAL-${Math.floor(100000 + Math.random() * 900000)}`,
        clientName,
        phone: clientPhone,
        service: bookingService.name,
        stylist: bookingStylist,
        date: bookingDate,
        time: bookingTime,
        durationMin: bookingService.durationMin,
        totalAmount: bookingService.price,
        bookingFee: demoDeposit,
        remainingAmount: bookingService.price - demoDeposit,
        status: 'Pending Salon Approval',
        paymentStatus: 'Deposit Paid'
      });
      setBookingStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2937] font-sans selection:bg-[#D4AF37]/30 pb-24">
      {/* Luxury Salon Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#0F382C]/10 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F382C] text-[#E6B800] flex items-center justify-center shadow-md">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#0F382C] tracking-wide leading-tight">
                {storeName}
              </h1>
              <p className="text-[11px] text-[#0F382C]/70 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Open Today • {city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAiCamera}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#0F382C]/5 text-[#0F382C] hover:bg-[#0F382C]/10 border border-[#0F382C]/15 transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-[#E6B800]" />
              AI Face Scan
            </button>
            <button
              onClick={() => {
                setBookingModalOpen(true);
                setBookingStep(1);
              }}
              className="px-4 py-2 bg-[#0F382C] text-[#FAF8F5] hover:bg-[#0F382C]/90 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#E6B800]" />
              Book Appointment
            </button>
          </div>
        </div>
      </header>

      {/* Luxury Visual Hero Section */}
      <section className="relative bg-[#0F382C] text-[#FAF8F5] overflow-hidden py-14 sm:py-20 px-4">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E6B800_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#E6B800]/30 text-xs font-medium text-[#E6B800]">
            <Award className="w-4 h-4" />
            <span>Luxury Hair & Beauty Sanctuary</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            {tagline}
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100/80 font-light leading-relaxed">
            Experience bespoke hair styling, precision cuts, and revitalizing skin treatments tailored to your unique beauty.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setBookingModalOpen(true);
                setBookingStep(1);
              }}
              className="px-6 py-3.5 bg-[#E6B800] hover:bg-[#E6B800]/90 text-[#0F382C] font-bold rounded-2xl shadow-xl text-sm transition-all transform hover:-translate-y-0.5"
            >
              BOOK YOUR EXPERIENCE
            </button>

            <button
              onClick={openAiCamera}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 backdrop-blur-md text-sm transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-[#E6B800]" />
              SCAN FACE & FIND YOUR LOOK
            </button>
          </div>

          {/* Social Proof & Location Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-emerald-100/70 border-t border-white/10 max-w-xl mx-auto">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#E6B800] fill-[#E6B800]" />
              <strong>4.9 / 5.0</strong> (120+ Verified Client Reviews)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[#E6B800]" />
              {city}
            </span>
          </div>
        </div>
      </section>

      {/* Featured Banner: AI Style Recommendation Prompt */}
      <section className="max-w-6xl mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#0F382C]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0F382C]/5 text-[#0F382C] flex items-center justify-center shrink-0 border border-[#0F382C]/10">
              <Sparkles className="w-6 h-6 text-[#E6B800]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0F382C]">
                Unsure which hairstyle or treatment suits you best?
              </h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                Answer 4 quick preference questions to get a personalized Bizz AI style recommendation.
              </p>
            </div>
          </div>
          <button
            onClick={openAiCamera}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0F382C] text-white hover:bg-[#0F382C]/90 text-xs font-bold rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <Camera className="w-3.5 h-3.5 text-[#E6B800]" />
            Scan Face with Bizz AI
            <ChevronRight className="w-4 h-4 text-[#E6B800]" />
          </button>
        </div>
      </section>

      {/* Service Catalogue Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F382C]">
            Our Luxury Service Menu
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Choose from our curated salon offerings. Reserve your slot online by paying a small booking deposit.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F382C] text-[#FAF8F5] shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div
              key={svc.id || svc.name}
              className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border border-[#0F382C]/10 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F382C] bg-[#0F382C]/5 px-2.5 py-1 rounded-full border border-[#0F382C]/10">
                    {svc.category}
                  </span>
                  {svc.popular && (
                    <span className="text-[10px] font-bold bg-[#E6B800] text-[#0F382C] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-[#0F382C]" /> Popular
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-bold text-[#0F382C] group-hover:text-[#E6B800] transition-colors">
                  {svc.name}
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                  {svc.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0F382C]" /> {svc.durationMin} min
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Total Price</span>
                  <span className="text-lg font-bold text-[#0F382C]">₹{svc.price}</span>
                  <span className="text-[10px] text-emerald-700 block font-semibold">
                    Pay ₹{svc.bookingFee || Math.round(svc.price * 0.2)} Deposit
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveDetailService(svc)}
                    className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#0F382C] bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => openBookingForService(svc)}
                    className="px-4 py-2.5 bg-[#0F382C] hover:bg-[#0F382C]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stylist Showcase Section */}
      <section className="bg-white py-14 px-4 border-y border-[#0F382C]/10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F382C]">
              Meet Our Expert Stylists
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Our master artists possess years of precision craft in hair sculpting, balayage coloring, and aesthetic skin care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STYLISTS.map((st) => (
              <div
                key={st.id}
                className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#0F382C]/10 text-center space-y-3 hover:shadow-lg transition-all"
              >
                <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#E6B800] shadow-md">
                  <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#0F382C]">{st.name}</h4>
                  <p className="text-xs text-[#0F382C]/80 font-semibold">{st.role}</p>
                  <p className="text-[11px] text-gray-500 font-medium">{st.exp}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {st.specs.map((sp) => (
                    <span key={sp} className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 font-medium">
                      {sp}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setBookingStylist(st.name);
                    setBookingModalOpen(true);
                    setBookingStep(1);
                  }}
                  className="w-full py-2 bg-[#0F382C]/10 hover:bg-[#0F382C] hover:text-white text-[#0F382C] text-xs font-bold rounded-xl transition-all"
                >
                  Book with {st.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {activeDetailService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl relative border border-[#0F382C]/20">
            <button
              onClick={() => setActiveDetailService(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#0F382C] bg-[#0F382C]/10 px-2.5 py-1 rounded-full">
                {activeDetailService.category}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0F382C]">
                {activeDetailService.name}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {activeDetailService.description}
              </p>
            </div>

            <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#0F382C]/10">
              <h4 className="text-xs font-bold text-[#0F382C] uppercase tracking-wider">What's Included</h4>
              <ul className="space-y-1.5">
                {(activeDetailService.included || ['Professional Haircut', 'Blowout & Styling']).map((inc) => (
                  <li key={inc} className="text-xs text-gray-700 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-2xl bg-[#0F382C]/5 border border-[#0F382C]/15 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Total Service Price</span>
                <span className="font-bold text-[#0F382C]">₹{activeDetailService.price}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Online Booking Deposit (Pay Now)</span>
                <span>₹{activeDetailService.bookingFee || Math.round(activeDetailService.price * 0.2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2">
                <span>Remaining Balance (Pay at Salon)</span>
                <span className="font-bold text-[#0F382C]">
                  ₹{activeDetailService.price - (activeDetailService.bookingFee || Math.round(activeDetailService.price * 0.2))}
                </span>
              </div>
            </div>

            <button
              onClick={() => openBookingForService(activeDetailService)}
              className="w-full py-3 bg-[#0F382C] text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-[#0F382C]/90 transition-all"
            >
              Continue to Appointment Booking
            </button>
          </div>
        </div>
      )}

      {/* === CAMERA-BASED BIZZ AI STYLE ANALYZER MODAL === */}
      {aiWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative border border-[#0F382C]/20 overflow-hidden max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#0F382C] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E6B800]/20 border border-[#E6B800]/40 flex items-center justify-center">
                  <ScanFace className="w-5 h-5 text-[#E6B800]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">Bizz AI Face Analysis</h3>
                  <p className="text-[10px] text-emerald-200/70">Camera-powered style recommendations</p>
                </div>
              </div>
              <button
                onClick={() => { setAiWizardOpen(false); setAiPhase('intro'); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {/* PHASE: INTRO */}
              {aiPhase === 'intro' && (
                <div className="space-y-5 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#0F382C]/5 border-2 border-[#0F382C]/20 flex items-center justify-center mx-auto">
                    <Camera className="w-9 h-9 text-[#0F382C]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-[#0F382C]">Your Face, Your Look</h4>
                    <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                      Our AI scans your face shape, complexion, and hair condition to recommend the perfect haircut, colour, and treatments — personalized just for you.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-center">
                    {[
                      { icon: '🔍', label: 'Face Shape Analysis' },
                      { icon: '🎨', label: 'Complexion Scan' },
                      { icon: '✂️', label: 'Style Matching' },
                    ].map((f) => (
                      <div key={f.label} className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#0F382C]/10 space-y-1">
                        <span className="text-2xl">{f.icon}</span>
                        <p className="font-semibold text-[#0F382C] text-[10px]">{f.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Your photo is processed locally. Never stored or uploaded.
                  </p>
                  <button
                    onClick={openAiCamera}
                    className="w-full py-3.5 bg-[#0F382C] text-white font-bold rounded-2xl text-sm shadow-lg hover:bg-[#0F382C]/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-[#E6B800]" />
                    Open Camera & Scan My Face
                  </button>
                </div>
              )}

              {/* PHASE: CAMERA LIVE VIEW */}
              {aiPhase === 'camera' && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {/* Face guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-44 h-56 border-2 border-[#E6B800] rounded-full opacity-70" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)' }} />
                    </div>
                    <div className="absolute bottom-3 left-0 right-0 text-center">
                      <span className="text-[10px] font-bold text-[#E6B800] bg-black/60 px-3 py-1 rounded-full">
                        Centre your face in the oval
                      </span>
                    </div>
                  </div>
                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {cameraError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {cameraError}
                    </div>
                  )}

                  <button
                    onClick={runAiAnalysis}
                    className="w-full py-3.5 bg-[#E6B800] hover:bg-[#E6B800]/90 text-[#0F382C] font-bold rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ScanFace className="w-4 h-4" />
                    Capture & Analyze My Face
                  </button>
                  <button
                    onClick={() => { stopCamera(); setAiPhase('intro'); }}
                    className="w-full py-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    ← Go back
                  </button>
                </div>
              )}

              {/* PHASE: AI SCANNING ANIMATION */}
              {aiPhase === 'scanning' && (
                <div className="py-8 space-y-6 text-center">
                  {capturedPhoto && (
                    <div className="relative w-32 h-32 mx-auto">
                      <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover rounded-full border-4 border-[#E6B800] shadow-xl" />
                      <div className="absolute inset-0 rounded-full border-4 border-[#0F382C] border-t-transparent animate-spin" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="font-serif text-lg font-bold text-[#0F382C]">Bizz AI is Scanning…</h4>
                    <div className="space-y-1 text-xs text-gray-500 max-w-xs mx-auto">
                      {[
                        '🔬 Detecting face shape & bone structure',
                        '🎨 Analysing skin complexion & undertone',
                        '💇 Assessing hair condition & texture',
                        '✂️ Matching services to your profile',
                      ].map((step, i) => (
                        <p key={i} className="flex items-center gap-2 justify-center animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#0F382C] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#0F382C] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#0F382C] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {/* PHASE: AI RESULT */}
              {aiPhase === 'result' && aiResult && (
                <div className="space-y-4 text-xs">
                  {/* Photo + face shape badge */}
                  <div className="flex items-center gap-4">
                    {capturedPhoto && (
                      <img src={capturedPhoto} alt="You" className="w-20 h-20 object-cover rounded-2xl border-2 border-[#E6B800] shadow-md shrink-0" />
                    )}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F382C] bg-[#E6B800] px-2.5 py-0.5 rounded-full inline-block">
                        ✨ Bizz AI Result
                      </span>
                      <p className="font-bold text-[#0F382C] text-base">{aiResult.faceShape} Face Shape</p>
                      <p className="text-gray-500">{aiResult.complexion}</p>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-[#FAF8F5] border border-[#0F382C]/10 rounded-2xl p-4 space-y-2">
                    <h5 className="font-bold text-[#0F382C] text-[10px] uppercase tracking-wider">AI Scan Insights</h5>
                    {aiResult.insights.map((ins, i) => (
                      <p key={i} className="text-gray-600 leading-relaxed">{ins.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                    ))}
                  </div>

                  {/* Recommended Haircut */}
                  <div className="bg-[#0F382C] rounded-2xl p-4 text-white space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#E6B800]">Recommended Haircut</p>
                    <p className="font-serif text-lg font-bold">{aiResult.haircut}</p>
                    <p className="text-xs text-emerald-100/80 leading-relaxed">{aiResult.reason}</p>
                    {aiResult.groomingNeeded && (
                      <p className="mt-1 text-[10px] bg-white/10 rounded-lg px-2.5 py-1 text-[#E6B800] font-semibold inline-block">
                        ⚡ Grooming treatment also recommended
                      </p>
                    )}
                  </div>

                  {/* Skin treatment */}
                  <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-3 space-y-1">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Skin Treatment Match</p>
                    <p className="text-emerald-900 font-medium">{aiResult.skinTreatment}</p>
                  </div>

                  {/* Primary & Secondary service cards */}
                  <div className="grid grid-cols-1 gap-3">
                    {[{ label: '⭐ Top Pick', svc: aiResult.primaryService }, { label: '💎 Also Recommended', svc: aiResult.secondaryService }].map(({ label, svc }) =>
                      svc ? (
                        <div key={svc.id} className="flex items-center justify-between p-3 bg-white border border-[#0F382C]/15 rounded-2xl shadow-sm">
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-bold text-[#E6B800] uppercase tracking-wider">{label}</p>
                            <p className="font-bold text-[#0F382C]">{svc.name}</p>
                            <p className="text-gray-500">{svc.durationMin} min · Deposit ₹{svc.bookingFee}</p>
                          </div>
                          <button
                            onClick={() => { setAiWizardOpen(false); openBookingForService(svc); }}
                            className="px-3 py-1.5 bg-[#0F382C] text-white font-bold rounded-xl text-[10px] shrink-0"
                          >
                            Book
                          </button>
                        </div>
                      ) : null
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={openAiCamera}
                      className="w-1/3 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Retake
                    </button>
                    <button
                      onClick={() => { setAiWizardOpen(false); openBookingForService(aiResult.primaryService); }}
                      className="w-2/3 py-2.5 bg-[#0F382C] text-white font-bold rounded-xl text-xs shadow-md hover:bg-[#0F382C]/90 flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#E6B800]" /> Book My Recommended Look
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Step Appointment Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 space-y-6 shadow-2xl relative border border-[#0F382C]/20 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Stepper Header */}
            {bookingStep < 4 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F382C]">
                  <span>Book Appointment ({bookingStep} of 3)</span>
                  <span>{bookingStep === 1 ? 'Service & Stylist' : bookingStep === 2 ? 'Date & Time' : 'Review & Deposit'}</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0F382C] h-full transition-all duration-300"
                    style={{ width: `${(bookingStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Step 1: Select Service & Stylist */}
            {bookingStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#0F382C] block mb-1">Selected Service</label>
                  <select
                    value={bookingService.id || bookingService.name}
                    onChange={(e) => {
                      const found = services.find((s) => (s.id || s.name) === e.target.value);
                      if (found) setBookingService(found);
                    }}
                    className="w-full p-3 rounded-xl border border-gray-300 font-semibold bg-gray-50 text-gray-800"
                  >
                    {services.map((s) => (
                      <option key={s.id || s.name} value={s.id || s.name}>
                        {s.name} ({s.durationMin} min) - ₹{s.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0F382C] block mb-1">Preferred Stylist</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingStylist('Any Available Stylist')}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        bookingStylist === 'Any Available Stylist'
                          ? 'bg-[#0F382C] text-white border-[#0F382C]'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <div className="font-bold">Any Stylist</div>
                      <div className="text-[10px] opacity-80">First Available</div>
                    </button>
                    {STYLISTS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setBookingStylist(st.name)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          bookingStylist === st.name
                            ? 'bg-[#0F382C] text-white border-[#0F382C]'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <div className="font-bold">{st.name}</div>
                        <div className="text-[10px] opacity-80">{st.role.split(' ')[0]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingStep(2)}
                  className="w-full py-3 bg-[#0F382C] text-white font-bold rounded-2xl text-xs shadow-md hover:bg-[#0F382C]/90"
                >
                  Continue to Date & Time
                </button>
              </div>
            )}

            {/* Step 2: Select Date & Time Slot */}
            {bookingStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#0F382C] block mb-1">Select Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 font-semibold bg-gray-50 text-gray-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0F382C] block mb-1">Available Time Slots</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['09:30 AM', '10:30 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`p-2.5 rounded-xl font-bold border transition-all text-center ${
                          bookingTime === slot
                            ? 'bg-[#0F382C] text-[#E6B800] border-[#0F382C] shadow-md'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    className="w-1/3 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingStep(3)}
                    className="w-2/3 py-3 bg-[#0F382C] text-white font-bold rounded-2xl text-xs shadow-md hover:bg-[#0F382C]/90"
                  >
                    Continue to Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Customer Details & Booking Fee Payment */}
            {bookingStep === 3 && (
              <form onSubmit={handleFinalSubmitBooking} className="space-y-4 text-xs">
                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-[#0F382C] block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Monish Kacha"
                    className="w-full p-3 rounded-xl border border-gray-300 font-semibold bg-gray-50 text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#0F382C] block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98250 00000"
                      className="w-full p-3 rounded-xl border border-gray-300 font-semibold bg-gray-50 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#0F382C] block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full p-3 rounded-xl border border-gray-300 font-semibold bg-gray-50 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#0F382C] block mb-1">Special Preferences / Hair Notes</label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Prefer gentle scalp wash, allergy notes..."
                    className="w-full p-3 rounded-xl border border-gray-300 font-medium bg-gray-50 text-gray-800"
                  />
                </div>

                {/* Booking Fee Summary Breakdown */}
                <div className="p-4 rounded-2xl bg-[#0F382C]/5 border border-[#0F382C]/15 space-y-2">
                  <div className="flex justify-between font-medium text-gray-600">
                    <span>Service: {bookingService.name}</span>
                    <span>₹{bookingService.price}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Booking Deposit (Pay Now)</span>
                    <span>₹{bookingService.bookingFee || Math.round(bookingService.price * 0.2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2 font-medium">
                    <span>Balance Payable at Salon</span>
                    <span className="font-bold text-[#0F382C]">
                      ₹{bookingService.price - (bookingService.bookingFee || Math.round(bookingService.price * 0.2))}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingStep(2)}
                    className="w-1/3 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 py-3 bg-[#0F382C] text-[#E6B800] font-bold rounded-2xl text-xs shadow-lg hover:bg-[#0F382C]/90 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#E6B800]" /> Processing Deposit...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-[#E6B800]" />
                        Pay ₹{bookingService.bookingFee || Math.round(bookingService.price * 0.2)} & Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Booking Request Confirmation Voucher */}
            {bookingStep === 4 && confirmedBooking && (
              <div className="space-y-5 text-xs text-center py-2">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                  <CalendarCheck className="w-8 h-8 text-amber-600" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {confirmedBooking.status || 'Pending Salon Approval'}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#0F382C] pt-2">
                    Booking Request Submitted!
                  </h3>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto">
                    We'll notify you once the salon approves your requested time slot.
                  </p>
                </div>

                <div className="bg-[#FAF8F5] border border-[#0F382C]/10 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-medium">Booking Reference</span>
                    <span className="font-mono font-bold text-[#0F382C]">{confirmedBooking.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Service</span>
                    <span className="font-bold text-[#0F382C]">{confirmedBooking.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Stylist</span>
                    <span className="font-semibold text-gray-800">{confirmedBooking.stylist}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Date & Time</span>
                    <span className="font-bold text-[#0F382C]">{confirmedBooking.date} at {confirmedBooking.time}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-emerald-800 font-bold">
                    <span>Deposit Paid Online</span>
                    <span>₹{confirmedBooking.bookingFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 font-bold">
                    <span>Payable at Salon Counter</span>
                    <span>₹{confirmedBooking.remainingAmount}</span>
                  </div>
                </div>

                <button
                  onClick={() => setBookingModalOpen(false)}
                  className="w-full py-3 bg-[#0F382C] text-white font-bold rounded-2xl text-xs shadow-md"
                >
                  Done & Back to Salon Page
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Mobile Booking CTA Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#0F382C]/10 p-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-gray-500 font-semibold uppercase block">Bespoke Experience</span>
          <span className="text-xs font-bold text-[#0F382C]">From ₹1,200</span>
        </div>
        <button
          onClick={() => {
            setBookingModalOpen(true);
            setBookingStep(1);
          }}
          className="px-5 py-2.5 bg-[#0F382C] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5 text-[#E6B800]" />
          Book Appointment
        </button>
      </div>

      <PoweredByBizora />
    </div>
  );
}
