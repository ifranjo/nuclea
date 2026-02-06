# NUCLEA Infrastructure Costs Analysis 2026

## Executive Summary

**Project:** NUCLEA - Digital Time Capsules with AI Avatars
**Analysis Date:** January 2026
**Research Method:** JARVIS-YT Protocol (5 web searches + 2 video sources)

---

## 1. Voice Cloning (ElevenLabs)

### Pricing Tiers

| Plan | Monthly Cost | Credits | Audio Hours | Best For |
|------|-------------|---------|-------------|----------|
| Free | $0 | 10,000 | ~20 min | Testing |
| Starter | $5 | 30,000 | ~1 hr | Prototyping |
| Creator | $11 | 100,000 | ~3 hrs | Small scale |
| **Pro** | **$99** | **500,000** | **~16 hrs** | **Production** |
| Scale | $330 | 2,000,000 | ~66 hrs | High volume |

### Voice Clone Types
- **Instant Clone**: Available from Starter plan ($5/mo)
- **Professional Clone**: Requires Creator+ plan
- Cost per character: ~1 credit = 1 character

### NUCLEA Recommendation
**Pro Plan ($99/mo)** for production:
- 500k credits = ~166 EverLife avatar voice generations
- Cost per avatar: **$0.60** (voice component only)

---

## 2. Video Generation (Wan 2.1/2.2 + ComfyUI)

### Hardware Requirements

| Model | VRAM Required | Notes |
|-------|--------------|-------|
| Wan 2.1 T2V-1.3B | 8GB | Consumer GPUs |
| Wan 2.2 5B | 8GB | With offloading |
| Wan 2.2 14B GGUF | 6GB | Quantized |
| Wan 2.2 14B Full | 15GB+ | Best quality |

### Generation Times (5-second video)

| GPU | Time | Quality |
|-----|------|---------|
| RTX 4090 | ~4 min | 480p |
| RTX 4090 | ~8 min | 720p |
| RTX 3060 12GB | ~15 min | 480p |
| RTX 5090 (2025) | ~2 min | 720p |

### Cloud GPU Pricing

| Provider | GPU | Hourly Cost | Monthly (24/7) |
|----------|-----|-------------|----------------|
| **RunPod** | RTX 4090 | $0.34-0.59/hr | ~$250-425 |
| Vast.ai | RTX 4090 | $0.18-0.30/hr | ~$130-220 |
| Lambda Labs | A100 40GB | $1.29/hr | ~$930 |
| Hetzner Dedicated | RTX 4090 | - | ~$300/mo |

### Recommended Stack for Video

```
ComfyUI Workflow Components:
├── Chatterbox TTS (text-to-speech)
├── Float Lip Sync (facial animation)
├── WanVace Outpaint (video generation)
├── ReActorFaceBoost (face enhancement)
├── VHS_VideoCombine (final output)
└── 226 nodes total in production workflow
```

---

## 3. Lip Sync & Talking Head

### Open Source (Self-Hosted)

| Tool | Cost | Quality | Speed |
|------|------|---------|-------|
| SadTalker | Free | Good | Fast |
| Wav2Lip | Free | Moderate | Fast |
| MultiTalk | Free | Excellent | Medium |
| InfiniteTalk | Free | Excellent | Slow |

### Commercial Platforms

| Platform | Starting Price | Best For |
|----------|---------------|----------|
| HeyGen | $29/mo | Quick results |
| D-ID | $20/mo | Simple avatars |
| Synthesia | $29/mo | Corporate |

### NUCLEA Recommendation
**Self-hosted** with:
- SadTalker (quick previews)
- MultiTalk (production quality)
- InfiniteTalk (long-form content)

---

## 4. Complete Cost Breakdown

### Per EverLife Avatar Creation

| Component | Cost | Notes |
|-----------|------|-------|
| Voice Clone Setup | $0.00 | One-time, included in plan |
| Initial TTS Generation | $0.30 | 5 min intro video |
| Video Generation (GPU) | $1.60 | 4 hrs @ $0.40/hr |
| Lip Sync Processing | $0.40 | 1 hr GPU time |
| Storage Setup | $0.10 | Initial upload |
| **TOTAL CREATION** | **$2.40** | |

### Monthly Ongoing Costs (per active user)

| Component | Cost | Notes |
|-----------|------|-------|
| Storage (2GB avg) | $0.05 | S3/R2 pricing |
| Interactive Sessions | $0.30 | 10 interactions/mo |
| LLM API (personality) | $0.10 | Claude/GPT |
| CDN/Bandwidth | $0.05 | Average usage |
| **TOTAL MONTHLY** | **$0.50** | |

### Platform Infrastructure (Fixed)

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| ElevenLabs Pro | $99 | Voice generation |
| RunPod Reserved | $150 | 2x RTX 4090 slots |
| Vercel Pro | $20 | Frontend hosting |
| Railway | $50 | Backend services |
| Cloudflare Pro | $20 | CDN + security |
| Firebase | $25 | Auth + DB |
| **TOTAL FIXED** | **$364** | |

---

## 5. Pricing Strategy

### Recommended Tiers

| Plan | Price | Margin | Target |
|------|-------|--------|--------|
| **Esencial** | 9.99/mo | 75% | Individual |
| **Familiar** | 24.99/mo | 80% | Families |
| **EverLife Premium** | 99 one-time + 9.99/mo | 70% | Legacy |

### Break-Even Analysis

```
Fixed Costs: $364/mo
Variable Cost/User: $0.50/mo
Average Revenue/User: $15/mo (blended)

Break-even: 364 / (15 - 0.50) = 25 paying users

Target for profitability: 50+ users = ~$400/mo profit
At 500 users: ~$7,000/mo profit
At 1000 users: ~$14,500/mo profit
```

---

## 6. Scaling Tiers

### Tier 1: MVP (0-100 users)
- **Cost:** $50-150/mo
- **Stack:** ElevenLabs Creator + RunPod on-demand + Vercel free
- **Process:** Manual avatar creation

### Tier 2: Growth (100-1000 users)
- **Cost:** $500-800/mo
- **Stack:** ElevenLabs Pro + Dedicated GPU + Full hosting
- **Process:** Semi-automated pipeline

### Tier 3: Scale (1000+ users)
- **Cost:** $2000-5000/mo
- **Stack:** Custom models + Multi-GPU cluster + CDN
- **Process:** Fully automated

---

## 7. Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    NUCLEA TECH STACK                        │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND                                                   │
│  ├── Next.js 14 (App Router)                               │
│  ├── Tailwind CSS                                          │
│  ├── Framer Motion                                         │
│  └── Zustand (state)                                       │
├─────────────────────────────────────────────────────────────┤
│  BACKEND                                                    │
│  ├── Firebase (Auth, Firestore, Storage)                   │
│  ├── Railway (API services)                                │
│  └── Vercel (Edge functions)                               │
├─────────────────────────────────────────────────────────────┤
│  AI SERVICES                                                │
│  ├── ElevenLabs (Voice cloning & TTS)                      │
│  ├── ComfyUI + Wan 2.1/2.2 (Video generation)              │
│  ├── Float Lip Sync + MultiTalk (Animation)                │
│  └── Claude API (Conversational personality)               │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE                                             │
│  ├── RunPod (GPU compute)                                  │
│  ├── Cloudflare R2 (Storage)                               │
│  ├── Cloudflare CDN (Delivery)                             │
│  └── GitHub Actions (CI/CD)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Research Sources

### Web Sources
1. [ElevenLabs API Pricing](https://elevenlabs.io/pricing/api)
2. [RunPod GPU Pricing](https://www.runpod.io/pricing)
3. [Wan 2.1 GitHub](https://github.com/Wan-Video/Wan2.1)
4. [ComfyUI Wan Tutorial](https://docs.comfy.org/tutorials/video/wan/wan2_2)
5. [Cloud GPU Comparison](https://computeprices.com/)

### Video Sources
1. [Wan 2.1 AI Talking Avatar Workflow](https://openart.ai/workflows/rocky533/wan-21-ai-talking-avatar-vace-chatterbox-float-v2/)
2. [ComfyUI Lip Sync Tutorial](https://www.classcentral.com/course/youtube-lipsync-in-comfyui-with-reactor-and-wav2lip-make-it-work-497262)

---

## 9. Next Steps

1. **Immediate:** Set up ElevenLabs Pro account
2. **Week 1:** Configure ComfyUI pipeline on RunPod
3. **Week 2:** Build avatar creation workflow
4. **Week 3:** Integrate with Firebase backend
5. **Week 4:** Launch beta to 10 early adopters

---

*Generated with JARVIS-YT Deep Research Protocol v2.0*
*Model: Claude Opus 4.5 | Date: 2026-01-24*
