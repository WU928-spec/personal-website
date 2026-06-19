import { motion } from 'framer-motion'
import { ArrowLeft, Home, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic'

const sections = [
  {
    type: 'intro',
    content: [
      '这个网站原来是我的个人网站，用于记录一些我的生活。后来打了《大浪》，真的吃的很好，所以决定给漓漓做一个售后，就是这个彩蛋了。',
      '我觉得这样的彩蛋形式很好，因为可以一直留下来，漓漓哪天想回味了，可以来这个网址看。',
    ],
  },
  {
    type: 'heading',
    text: '最初的构想',
  },
  {
    type: 'paragraph',
    content: [
      '一开始的思路是用冥王星日记的形式，写出冥王星的心路历程。然后每一个日记都单独设计界面和配图。',
      '但是发现可以写的真的太多了，生图也很耗时间。所以也算是虎头蛇尾了。彩蛋制作也是经历了很多波折，说实话我是不是很满意的。',
    ],
  },
  {
    type: 'heading',
    text: '那些耽搁',
  },
  {
    type: 'paragraph',
    content: [
      '再一个，既然作为售后，那么肯定是越早做出来给漓漓看越好。给了漓漓那么多期待，又很久不能交付，我很急。中间又和漓漓发生了很多事，我的思绪也很混乱，那段时间都在考虑怎么和漓漓相处。又耽搁了制作，之后又是找实习，又是复习，也抽不出来一点时间。',
    ],
  },
  {
    type: 'heading',
    text: '为什么还是做了',
  },
  {
    type: 'paragraph',
    content: [
      '后面的一些时间，我一直在想到底要不要做这个售后呢。其实我在那次去松江喝酒之后，就一直不敢主动接触和你有关的事物。我害怕我再次上头，豆包告诉我至少一个星期不要有任何接触。我照做了，情况确实好了很多，我能忍住不继续找你，专注于我自己。',
      '但我又可惜，我做了10小时+的售后流产。所以今天猛猛干了一天，将售后草草做出来，没有做后面星星的文案，把我最想写的冥王星和漱石分开5年的日记写了出来。',
    ],
  },
  {
    type: 'quote',
    content: [
      '之所以我一定写这段日记，是因为我常常接触这种失去，对这种感觉十分了解。突然的断连也如同我和你的关系，所以日记里冥王星写的信，某种程度上也是我想对你说的话。',
      '但是就像冥王星没有将信寄出去，很多话我也没有对你说。不是不能说，是不敢说。说了会获得片刻的安宁，但之后的戒断只会更加痛苦。',
    ],
  },
  {
    type: 'paragraph',
    content: [
      '知道漓漓看了之后肯定不开心，因为没有写冥王星和漱石重逢后的欢乐时光，可以说没有幸福可言。但我没有接触过幸福，所以也写不出幸福的模样。我接触过最幸福的时刻就是即将到达的幸福。我将这个售后的故事停留在此刻，是我对冥王星5年等待能想到的最温柔的回答。',
    ],
  },
  {
    type: 'heading',
    text: '一些没实现的想法',
  },
  {
    type: 'list',
    items: [
      '关于星星的亮度：本来想用星星的亮度来表达冥王星写日记时的心情起伏程度，但是因为没把所有星星写完，又要触发彩蛋，只好把写的星星亮度调成百分百，没写的调成0，方便漓漓辨认哪些写了哪些没写。',
      '第一次被拒绝的买醉：这一块我挺想写的，但没写。',
      '压缩的视频和音乐：为了方便你加载，所以照片、音乐、视频都做了压缩。',
      '星轨视频：我做的星轨视频真的不是很满意，太短了，也不是整片星空，而是半片星空。',
      '照片：照片少了，本来想制作一个类似相片册的东西的。',
    ],
  },
  {
    type: 'heading',
    text: '最后',
  },
  {
    type: 'paragraph',
    content: [
      '总之，感谢漓漓看到这里。以后我每一个售后都会发布在这个网站，但应该不会那么复杂了，只会是一张海报。这个售后我会在网站中制作一个区域储存，设置一个密码。如果以后有机会，我也会补充没有写完的星星（挖坑中），但大概率不会，因为搭建的脚手架已经拆了，所有数据都是静态数据，改起来很麻烦。',
      '售后中冥王星对漱石的爱，也是我向往中的爱情，因为爱，所以事事都想和你分享，因为爱，所以会喜欢你喜欢的东西。',
      '想说的永远说不完，洋洋洒洒又是1000字，一切尽在不言中吧。',
    ],
  },
  {
    type: 'closing',
    content: [
      '谢谢你走到这里。',
      '这片星空本是我一个人的秘密，但当你点亮第十四颗星时，它也成了我们共同见证过的光。',
      '那些散落的故事、未说出口的话、以及所有笨拙的温柔，都被我藏进了这些星轨里。如果你曾在某一句话前停留，那便是它们存在的意义。',
    ],
  },
]

export default function StarryEpilogue() {
  const navigate = useNavigate()
  useBackgroundMusic('/epilogue-music.mp3')

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508]">
      {/* 星空背景 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/starry-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* 暗角 */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* 顶部标题 */}
      <div className="relative z-20 pt-[8vh] pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <h1 className="text-white/95 font-body text-2xl md:text-3xl tracking-[0.4em] mb-3">
            致漓漓
          </h1>
          <div className="w-12 h-px bg-white/30 mx-auto" />
          <p className="mt-4 text-white/40 text-xs tracking-[0.25em]">
            彩蛋后记
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-6 flex justify-center"
        >
          <ChevronDown size={18} className="text-white/30 animate-bounce" />
        </motion.div>
      </div>

      {/* 内容层 */}
      <div className="relative z-10 px-4 pb-32 md:px-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {sections.map((section, index) => {
            const delay = 0.2 + index * 0.12

            if (section.type === 'heading') {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay }}
                  className="pt-10 pb-4"
                >
                  <h2 className="text-white/80 font-body text-base md:text-lg tracking-[0.2em]">
                    {section.text}
                  </h2>
                  <div className="mt-2 w-8 h-px bg-gradient-to-r from-white/40 to-transparent" />
                </motion.div>
              )
            }

            if (section.type === 'quote') {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 1, delay }}
                  className="my-8 pl-5 pr-4 py-5 border-l-2 border-white/20 bg-white/[0.03] backdrop-blur-sm rounded-r-lg"
                >
                  {section.content?.map((text, i) => (
                    <p
                      key={i}
                      className="text-white/75 font-body text-sm md:text-[15px] leading-[2] tracking-wide italic"
                    >
                      {text}
                    </p>
                  ))}
                </motion.div>
              )
            }

            if (section.type === 'list') {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay }}
                  className="space-y-4 py-2"
                >
                  {section.items?.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="mt-2 w-1 h-1 rounded-full bg-white/40 shrink-0" />
                      <p className="text-white/60 font-body text-sm md:text-[15px] leading-[1.85] tracking-wide">
                        {item}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )
            }

            if (section.type === 'closing') {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 1.2, delay }}
                  className="mt-16 mb-8 text-center space-y-5"
                >
                  {section.content?.map((text, i) => (
                    <p
                      key={i}
                      className={`text-white/${i === 0 ? '90' : '60'} font-body ${
                        i === 0 ? 'text-base tracking-[0.2em]' : 'text-sm md:text-[15px] leading-[2] tracking-wide'
                      }`}
                    >
                      {text}
                    </p>
                  ))}
                  <div className="pt-6 text-white/40 text-xs font-body tracking-[0.25em]">
                    —— 作者
                  </div>
                </motion.div>
              )
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay }}
                className="space-y-4 py-2"
              >
                {section.content?.map((text, i) => (
                  <p
                    key={i}
                    className="text-white/65 font-body text-sm md:text-[15px] leading-[1.95] tracking-wide text-justify"
                  >
                    {text}
                  </p>
                ))}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 导航按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="fixed bottom-8 left-0 right-0 z-30 flex items-center justify-center gap-4"
      >
        <button
          type="button"
          onClick={() => navigate('/starry')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-5 py-2.5 rounded-full border border-white/10"
        >
          <ArrowLeft size={16} />
          <span className="text-sm font-body tracking-widest">返回星空</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 backdrop-blur-sm bg-white/5 px-5 py-2.5 rounded-full border border-white/10"
        >
          <Home size={16} />
          <span className="text-sm font-body tracking-widest">回到首页</span>
        </button>
      </motion.div>
    </div>
  )
}
