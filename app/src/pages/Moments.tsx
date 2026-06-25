import { AnimatePresence } from 'framer-motion'
import { Camera, RefreshCw, CloudOff } from 'lucide-react'
import PageSEO from '@/components/PageSEO'
import MomentCard from '@/components/MomentCard'
import MomentUploader from '@/components/MomentUploader'
import { useMoments } from '@/hooks/useMoments'
import { useAuth } from '@/contexts/AuthContext'

export default function Moments() {
  const { owner, isLoggedIn } = useAuth()
  const avatarUrl = owner.avatar
  const displayName = owner.username
  const {
    moments,
    loading,
    addMoment,
    toggleLike,
    addComment,
    deleteMoment,
    syncError,
    usingLocal,
    retrySync,
  } = useMoments()

  return (
    <div className="min-h-screen bg-[#ededed] dark:bg-[#111]">
      <PageSEO
        title="动态墙"
        description="分享生活中的每一个瞬间"
        path="/moments"
      />

      {/* Sync error banner */}
      {syncError && (
        <div className="max-w-2xl mx-auto mt-4 px-4">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-Amber/10 border border-Amber/20 text-sm">
            <div className="flex items-center gap-2 text-Amber/80">
              <CloudOff size={14} />
              <span>{usingLocal ? '正在使用本地数据（云端同步失败）' : syncError}</span>
            </div>
            <button
              onClick={retrySync}
              className="flex items-center gap-1 text-xs text-Amber hover:text-Amber/80 transition-colors"
            >
              <RefreshCw size={12} />
              重试同步
            </button>
          </div>
        </div>
      )}

      {/* ── Cover + Profile Header ── */}
      <div className="relative">
        {/* Cover Image */}
        <div
          className="h-[300px] w-full bg-cover bg-top"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop)',
          }}
        />

        {/* Profile Info */}
        <div className="max-w-2xl mx-auto px-4 relative">
          <div className="flex items-end justify-end gap-3 -mt-10 pb-4">
            <div className="text-right pb-2">
              <h1 className="text-white text-[1.125rem] font-medium drop-shadow-md">
                {displayName}
              </h1>
            </div>
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-20 h-20 rounded-[4px] object-cover border-4 border-white dark:border-[#111] shadow-lg shrink-0"
            />
          </div>
        </div>
      </div>

      {/* ── Publisher (logged-in only) ── */}
      {isLoggedIn && (
        <div className="max-w-2xl mx-auto mt-2">
          <MomentUploader onSubmit={addMoment} avatarUrl={avatarUrl} userName={displayName} userId={owner.userId} />
        </div>
      )}

      {/* ── Feed ── */}
      <div className="max-w-2xl mx-auto mt-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-Amber border-t-transparent rounded-full animate-spin" />
          </div>
        ) : moments.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Camera size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-[0.9375rem]">
              还没有动态
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              在上方发布第一条吧
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {moments.map((moment, i) => (
                <div key={moment.id}>
                  <MomentCard
                    moment={moment}
                    index={i}
                    showDelete={isLoggedIn}
                    onLike={toggleLike}
                    onComment={addComment}
                    onDelete={deleteMoment}
                  />
                  {i < moments.length - 1 && (
                    <div className="h-[1px] bg-gray-200 dark:bg-white/5 mx-4" />
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Bottom spacer ── */}
      <div className="h-12" />
    </div>
  )
}
