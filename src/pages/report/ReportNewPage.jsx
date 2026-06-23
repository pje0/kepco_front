import React from 'react';
import { CheckCircle, MapPin, AlertTriangle, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useReportNewLogic from './useReportNewLogic';
import './ReportNewPage.css';

export default function ReportNewPage() {
  const {
    formData, isLoading, success, isAgreed, setIsAgreed, zoomLevel,
    handleChange, handleAddressSearch, handleSubmit, resetForm, handlePrint, navigate,
    zoomIn, zoomOut, zoomControlRef
  } = useReportNewLogic();

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <CheckCircle className="h-20 w-20 text-blue-600 mb-6" />
        <h2 className="text-3xl font-bold text-slate-800 mb-4">신청이 정상적으로 접수되었습니다.</h2>
        <p className="text-slate-600 mb-10 text-lg">
          작성해주신 내용을 AI가 분석하여 최적의 부서 및 복구팀을 배정합니다.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/report/my')} className="bg-blue-700 hover:bg-blue-800 px-8 py-6 text-lg">
            내 민원 현황 보기
          </Button>
          <Button variant="outline" onClick={resetForm} className="px-8 py-6 text-lg border-slate-300">
            추가 신청하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="nd-wrapper">

      {/* ── [고정 영역] 타이틀 및 휠 줌/인쇄 버튼 ── */}
      <div className="flex justify-between items-end mb-6 print-hide">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">신고 신청</h1>
          <p className="text-slate-500 mt-2">AI 스마트 접수</p>
        </div>
        
        <div className="flex items-center gap-3">
          
          {/* 🚨 휠 스크롤 줌 컨트롤러 (onWheel 대신 ref 장착) */}
          <div 
            ref={zoomControlRef}
            className="flex items-center bg-white border border-slate-300 rounded-md p-0.5 shadow-sm hover:border-blue-400 transition-colors cursor-ns-resize"
            title="여기에 마우스를 올리고 휠을 위아래로 굴려보세요!"
          >
            <button type="button" onClick={zoomOut} className="px-2 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-black rounded transition-colors" title="화면 축소">
              <ZoomOut size={16} />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-0.5"></div>
            <button type="button" onClick={zoomIn} className="px-2 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-black rounded transition-colors" title="화면 확대">
              <ZoomIn size={16} />
            </button>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded ml-1 w-14 text-center pointer-events-none">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <button type="button" className="nd-back-btn text-sm px-4 py-2" onClick={handlePrint}>
            <Printer size={16} /> 현재 화면 인쇄
          </button>
        </div>
      </div>

      {/* 🚨 확대/축소될 본문 영역 (zoomLevel 적용) */}
      <div style={{ zoom: zoomLevel }} className="transition-all duration-200 transform-origin-top">
        
        {/* 안전 수칙 경고 배너 */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-md print-hide">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-red-800 text-sm mb-1">안전 수칙 안내 및 주의사항</h4>
              <p className="text-red-700 text-sm leading-relaxed">
                감전 및 2차 화재 위험이 있으므로 끊어진 전선이나 스파크 발생 지점 근처에 절대 접근하지 마시고, <br/>
                반드시 안전한 곳으로 대피하신 후 신고를 진행해 주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>

        {/* 메인 신고 폼 영역 */}
        <Card className="main-card print:shadow-none print:border-black">
          <CardHeader className="bg-slate-50 border-b border-slate-100 px-8 py-6 print-hide">
            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
              <CheckCircle className="text-blue-600" size={20}/> 현장 상황 입력
            </CardTitle>
            <CardDescription className="text-sm">
              상황을 자세히 적어주시면 AI가 자동으로 고장 유형과 긴급도를 파악합니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* 제목 */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-bold text-slate-700">신청 제목 <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="예: 아파트 인근 지상 변압기 파손"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  disabled={isLoading}
                  className="bg-white py-6 text-base"
                />
              </div>

              {/* 주소 검색 */}
              <div className="space-y-3">
                <Label className="text-base font-bold text-slate-700">발생 위치 (주소) <span className="text-red-500">*</span></Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="주소 검색 버튼을 눌러 위치를 지정하세요"
                    value={formData.address}
                    readOnly
                    className="flex-1 bg-slate-50 py-6 text-base text-slate-700 font-medium cursor-not-allowed"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddressSearch}
                    disabled={isLoading}
                    className="px-6 py-6 border-slate-300 hover:bg-slate-50 text-base print-hide"
                  >
                    <MapPin size={18} className="mr-2" /> 주소 검색
                  </Button>
                </div>
                {/* 🚨 상세 주소 입력칸 추가 */}
                <Input
                  placeholder="상세 주소를 입력해주세요"
                  value={formData.detailAddress}
                  onChange={(e) => handleChange('detailAddress', e.target.value)}
                  disabled={!formData.address || isLoading}
                  className="bg-white py-6 text-base mt-2"
                />
              </div>

              {/* 상세 내용 */}
              <div className="space-y-3">
                <Label htmlFor="content" className="text-base font-bold text-slate-700">상세 내용 <span className="text-red-500">*</span></Label>
                <Textarea
                  id="content"
                  placeholder="파손된 설비의 특징이나 현재 상황(스파크, 냄새, 연기 등)을 최대한 상세히 적어주세요."
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  disabled={isLoading}
                  rows={8}
                  className="bg-white text-base leading-relaxed resize-none"
                />
              </div>

              {/* 약관 동의 */}
              <div className="mt-12 pt-8 border-t border-slate-200 print-hide">
                <h3 className="text-sm font-bold text-slate-800 mb-3">개인정보 수집 및 이용 동의</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 h-32 overflow-y-auto text-xs text-slate-600 leading-relaxed mb-4">
                  <strong>1. 수집하는 개인정보 항목:</strong> 성명, 이메일, 연락처 (회원정보 자동 연동) <br />
                  <strong>2. 수집 및 이용 목적:</strong> 신고 민원 접수, 현장 출동 안내, 처리 결과 통보 및 사후 관리 <br />
                  <strong>3. 보유 및 이용 기간:</strong> 관계 법령에 따른 보존 기간 또는 민원 처리 완료 후 3년 <br />
                  <strong>4. 동의 거부권 안내:</strong> 귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 동의를 거부하실 경우 원활한 민원 접수 및 현장 조치 안내가 제한될 수 있습니다.
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="agreement" 
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                  />
                  <label htmlFor="agreement" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    위 개인정보 수집 및 이용 약관에 동의합니다. <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="pt-4 print-hide">
                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-7 text-lg font-bold shadow-md transition-all hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'AI가 분석 및 접수 중입니다...' : '신청하기'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}