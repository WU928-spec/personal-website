import PageSEO from '@/components/PageSEO'
import HeroSection from '@/components/home/HeroSection'
import IntroSection from '@/components/home/IntroSection'
import SkillSection from '@/components/home/SkillSection'
import GitHubSection from '@/components/home/GitHubSection'

export default function Home() {
  return (
    <div>
      <PageSEO
        title="Vibecoding Garden"
        description="A digital garden of code, thoughts, and slow programming. Explore blog posts, projects, and a Zettelkasten-inspired knowledge base."
      />
      <HeroSection />
      <IntroSection />
      <SkillSection />
      <GitHubSection />
    </div>
  )
}
