import React from 'react';
import { FileText, CheckCircle, MapPin, AlertTriangle, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useReportNewLogic from './useReportNewLogic';
import './ReportNewPage.css';

export default function ReportNewPage() {
  const {
    formData, isLoading, success, isAgreed, setIsAgreed,
    handleChange, handleAddressSearch, handleSubmit, resetForm, handlePrint, navigate
  } = useReportNewLogic();

  if (success) {
    return (
      <div className="report-wide-container flex flex-col items-center justify-center py-32 gap-6 text-center">
        <CheckCircle className="h-24 w-24 text-green-500 drop-shadow-md" />
        <div>
          <h2 className="text-3xl font-bold mb-3 text-slate-800">신청이 정상적으로 접수되었습니다.</h2>
          <p className="text-lg text-slate-500">작성해주신 내용을 AI가 분석하여 최적의 부서 및 복구팀을 배정합니다.</p>
        </div>
        <div className="flex gap-4 mt-6 print-hide">
          <Button onClick={() => navigate('/report/my')} className="bg-blue-700 hover:bg-blue-800 px-8 py-6 text-lg">내 민원 현황 보기</Button>
          <Button variant="outline" onClick={resetForm} className="px-8 py-6 text-lg">추가 신청하기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-wide-container space-y-6">
      
      {/* 🚨 타이틀 및 인쇄 버튼 영역 */}
      <div className="flex items-center justify-between border-b-2 border-blue-800 pb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-700" />
          <h1 className="text-3xl font-bold text-slate-900">신고 신청</h1>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded ml-2">AI 스마트 접수</span>
        </div>
        <Button variant="outline" onClick={handlePrint} className="print-hide gap-2 text-slate-600 border-slate-300 hover:bg-slate-50">
          <Printer size={18} /> 현재 화면 인쇄
        </Button>
      </div>

      {/* 🚨 [신규] 안전 수칙 경고 배너 */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3 shadow-sm print-hide">
        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-bold text-red-800 mb-1 text-lg">안전 수칙 안내 및 주의사항</h3>
          <p className="text-red-700 font-medium leading-relaxed">
            감전 및 2차 화재 위험이 있으므로 끊어진 전선이나 스파크 발생 지점 근처에 <strong>절대 접근하지 마시고</strong>, <br />
            반드시 안전한 곳으로 대피하신 후 신고를 진행해 주시기 바랍니다.
          </p>
        </div>
      </div>

      <Card className="shadow-lg border-t-4 border-t-blue-700 rounded-xl overflow-hidden print-card">
        <CardHeader className="bg-slate-50 border-b py-6">
          <CardTitle className="text-2xl text-slate-800">현장 상황 입력</CardTitle>
          <CardDescription className="text-base text-slate-500 mt-1">
            상황을 자세히 적어주시면 AI가 자동으로 고장 유형과 긴급도를 파악합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-bold text-slate-700">신청 제목 <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="예) 아파트 인근 지상 변압기 파손" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} disabled={isLoading} className="bg-white py-6 text-base" />
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-base font-bold text-slate-700">발생 위치 (주소) <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  <Input id="address" placeholder="주소 검색 버튼을 눌러 정확한 위치를 입력하세요." value={formData.address} readOnly disabled={isLoading} className="flex-1 bg-white cursor-pointer py-6 text-base" onClick={handleAddressSearch} />
                  <Button type="button" onClick={handleAddressSearch} className="bg-slate-800 hover:bg-slate-900 px-6 h-auto shadow-sm print-hide">
                    <MapPin size={18} className="mr-2" /> 주소 검색
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="content" className="text-base font-bold text-slate-700">신청 상세 내용 <span className="text-red-500">*</span></Label>
              <Textarea id="content" placeholder="현재 상황, 위험 정도, 주변 구조물 등 현장 상황을 최대한 자세히 작성해 주세요. 작성해주신 내용은 AI가 분석하여 고장 유형을 자동 판별합니다." rows={8} value={formData.content} onChange={(e) => handleChange('content', e.target.value)} disabled={isLoading} className="bg-white resize-none text-base p-4 leading-relaxed" />
            </div>

            <div className="space-y-3 pt-4 print-hide">
              <Label className="text-base font-bold text-slate-700">개인정보 수집 및 이용 동의 <span className="text-red-500">*</span></Label>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-5 text-sm text-slate-600 space-y-3 h-40 overflow-y-auto leading-relaxed shadow-inner">
                <p className="font-semibold text-slate-800 text-base mb-2">한국전력공사는 민원 신청 및 처리를 위해 아래와 같이 개인정보를 수집 및 이용합니다.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>수집항목:</strong> 성명, 연락처, 이메일, 발생 위치(주소), 신고 내용 <br/><span className="text-slate-400 text-xs">(※ 성명, 연락처, 이메일 등은 로그인된 회원 정보에서 자동 수집됩니다.)</span></li>
                  <li><strong>수집목적:</strong> 정전·고장 민원 접수, 현장 출동 및 처리 결과 안내, 민원 이력 관리</li>
                  <li><strong>보유 및 이용기간:</strong> <span className="text-blue-600 font-bold">민원 처리 완료 후 3년</span> (보존 기한 경과 시 지체 없이 파기)</li>
                  <li><strong>동의 거부권 및 불이익:</strong> 사용자는 본 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 동의를 거부하실 경우 정전·고장 신고 신청 서비스 이용이 제한됩니다.</li>
                </ul>
              </div>
              <div className="flex items-center gap-2 mt-3 pl-1">
                <input
                  type="checkbox"
                  id="privacy-agree"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  disabled={isLoading}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <Label htmlFor="privacy-agree" className="text-base font-medium text-slate-700 cursor-pointer select-none">
                  위 개인정보 수집 및 이용 안내를 확인하였으며, 이에 동의합니다.
                </Label>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-6 border-t border-slate-200 print-hide">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading} className="w-32 py-6 text-base">
                취소
              </Button>
              <Button type="submit" disabled={isLoading} className="w-64 bg-blue-700 hover:bg-blue-800 shadow-md py-6 text-lg font-bold">
                {isLoading ? '처리 중...' : '신청하기'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}