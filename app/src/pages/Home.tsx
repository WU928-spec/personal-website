import PageSEO from '@/components/PageSEO'
import HeroSection from '@/components/home/HeroSection'
import IntroSection from '@/components/home/IntroSection'
import RecentMomentsSection from '@/components/home/RecentMomentsSection'
import LatestNotesSection from '@/components/home/LatestNotesSection'
import GitHubSection from '@/components/home/GitHubSection'

export default function Home() {
  return (
    <div>
      <PageSEO title="Jasper 的小角落" description="记录生活、阅读、思考，以及一些做过的小东西。" />
      <HeroSection />
      <IntroSection />
      <RecentMomentsSection />
      <LatestNotesSection />
      <GitHubSection />
    </div>
  )
}
