import { Link } from 'react-router-dom'
import { Zap, FileText, Truck, BarChart3, Shield, AlertCircle, Users, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FEATURES = [
  { icon: FileText, title: '정전·고장 신고', desc: '언제 어디서나 빠르게 신고하고 처리 현황을 실시간으로 확인하세요.' },
  { icon: Truck, title: '파견 관리', desc: '신고 접수부터 현장 출동까지 전 과정을 체계적으로 관리합니다.' },
  { icon: BarChart3, title: '통계 대시보드', desc: '신고 현황, 처리 속도, 지역별 분포를 한눈에 파악하세요.' },
  { icon: Shield, title: '역할 기반 접근', desc: '시민·인사·파견·출동요원·관리자별 맞춤 기능을 제공합니다.' },
]

const QUICK_FEATURES = [
  { icon: AlertCircle, label: '긴급 신고' },
  { icon: Truck, label: '파견 현황' },
  { icon: BarChart3, label: '통계 조회' },
  { icon: CheckCircle2, label: '처리 완료' },
  { icon: Users, label: '인사 관리' },
  { icon: TrendingUp, label: '성과 분석' },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      

      {/* 히어로 섹션 */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-800 to-blue-600 text-white py-24 px-4 overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 좌측 텍스트 */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  정전·고장 신고<br />
                  <span className="text-yellow-300">파견 관리 시스템</span>
                </h1>
                <p className="text-lg text-blue-100">
                  신고부터 처리까지 모든 과정을 디지털로 관리하고, 신속한 대응으로 고객 만족도를 높입니다.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold" asChild>
                  {/* <Link to="/login">로그인하기</Link> */}
                </Button>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-blue-100">연중무휴 운영</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-2xl font-bold">5개</p>
                  <p className="text-sm text-blue-100">역할 기반 접근</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-blue-100">추적 가능</p>
                </div>
              </div>
            </div>

            {/* 우측 일러스트 영역 */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                {/* 배경 원 */}
                <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>

                {/* 메인 아이콘 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative flex items-center justify-center h-40 w-40 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                      <Zap className="h-20 w-20 text-yellow-300 fill-yellow-300" />
                    </div>
                  </div>
                </div>

                {/* 플로팅 요소들 */}
                <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30 animate-bounce" style={{ animationDelay: '0s' }}>
                  <AlertCircle className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="absolute bottom-12 left-8 bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <CheckCircle2 className="h-6 w-6 text-green-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 빠른 접근 기능 */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {QUICK_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-medium text-center text-slate-700 dark:text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">주요 기능</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">한국전력 MIS의 핵심 기능들을 소개합니다</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                <CardHeader>
                  <div className="flex justify-center mb-3">
                    <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Icon className="h-7 w-7 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                  <CardTitle className="text-base text-slate-900 dark:text-white">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600">
                  <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                <span className="font-bold">한국전력 MIS</span>
              </div>
              <p className="text-sm text-slate-400">정전·고장 신고 파견 관리 시스템</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">주요 기능</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><a href="#" className="hover:text-white transition">신고 접수</a></li>
                <li><a href="#" className="hover:text-white transition">파견 관리</a></li>
                <li><a href="#" className="hover:text-white transition">통계 조회</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">고객 지원</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><a href="#" className="hover:text-white transition">공지사항</a></li>
                <li><a href="#" className="hover:text-white transition">자료실</a></li>
                <li><a href="#" className="hover:text-white transition">문의하기</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
            <p>&copy; 2026 한국전력공사. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
