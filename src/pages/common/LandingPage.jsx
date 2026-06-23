import { Link } from 'react-router-dom'
import { Zap, FileText, Truck, BarChart3, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const FEATURES = [
  { icon: FileText, title: '정전·고장 신고', desc: '언제 어디서나 빠르게 신고하고 처리 현황을 실시간으로 확인하세요.' },
  { icon: Truck,    title: '파견 관리',     desc: '신고 접수부터 현장 출동까지 전 과정을 체계적으로 관리합니다.' },
  { icon: BarChart3, title: '통계 대시보드', desc: '신고 현황, 처리 속도, 지역별 분포를 한눈에 파악하세요.' },
  { icon: Shield,   title: '역할 기반 접근', desc: '시민·인사·파견·출동요원·관리자별 맞춤 기능을 제공합니다.' },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10">
              <Zap className="h-10 w-10 text-primary fill-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            한국전력 정전·고장<br />
            <span className="text-primary">신고 파견 관리 시스템</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            정전 및 전기 고장 신고부터 현장 출동, 처리 완료까지
            전 과정을 디지털로 관리하는 통합 플랫폼입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/login">시작하기</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">로그인</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10">주요 기능</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="text-center hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 테스트 계정 안내 */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-center text-lg">🔑 테스트 계정 안내</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 font-medium">역할</th>
                      <th className="py-2 px-3 font-medium">아이디</th>
                      <th className="py-2 px-3 font-medium">비밀번호</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['시민', 'citizen1', '1234'],
                      ['인사담당', 'hr1', '1234'],
                      ['파견담당', 'dispatch1', '1234'],
                      ['관리자', 'admin1', '1234'],
                      ['출동요원', 'worker1', '1234'],
                    ].map(([role, id, pw]) => (
                      <tr key={id} className="border-b last:border-0">
                        <td className="py-2 px-3 text-muted-foreground">{role}</td>
                        <td className="py-2 px-3 font-mono font-medium">{id}</td>
                        <td className="py-2 px-3 font-mono">{pw}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
