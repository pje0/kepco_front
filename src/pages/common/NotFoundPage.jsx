import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-8xl font-bold text-primary/20">404</div>
      <div>
        <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/home">홈으로</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">메인으로</Link>
        </Button>
      </div>
    </div>
  )
}
