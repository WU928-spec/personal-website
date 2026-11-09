import { Navigate, Route, Routes } from 'react-router-dom'
import Tools from '@/pages/Tools'
import InternshipDecision from '@/pages/InternshipDecision'
import TextSegmenter from '@/pages/TextSegmenter'
import MovieRecommender from '@/pages/MovieRecommender'
import DevTools from '@/pages/DevTools'
import GitCondaGuide from '@/pages/GitCondaGuide'

export default function LegacyToolsApp() {
  return (
    <Routes>
      <Route path="/tools" element={<Tools />} />
      <Route path="/tools/internship" element={<InternshipDecision />} />
      <Route path="/tools/text-segmenter" element={<TextSegmenter />} />
      <Route path="/tools/movie-recommender" element={<MovieRecommender />} />
      <Route path="/tools/devtools" element={<DevTools />} />
      <Route path="/tools/git-conda-guide" element={<GitCondaGuide />} />
      <Route path="*" element={<Navigate to="/tools" replace />} />
    </Routes>
  )
}
