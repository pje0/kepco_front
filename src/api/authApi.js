import axiosInstance from './axiosInstance'

/**
 * 로그인 API (백엔드 응답 규격 맞춤형)
 */
export async function login(username, password) {
  return axiosInstance.post('/auth/login', { username, password })
    .then(async res => {
      const token = res.data.token;
      
      if (token) {
        localStorage.setItem('accessToken', token);
        
        try {
          const userDetail = await getMe();
          localStorage.setItem('user', JSON.stringify(userDetail));
          return { accessToken: token, user: userDetail };
        } catch (meError) {
          console.error("로그인 후 유저 정보를 가져오는데 실패했습니다.", meError);
          throw new Error('유저 정보 인증에 실패했습니다.');
        }
      }
      
      throw new Error('토큰 정보가 누락되었습니다.');
    })
}

/**
 * 로그아웃 API (403 에러 철저 방어형)
 */
export async function logout() {
  return axiosInstance.post('/auth/logout')
    .catch(error => {
      console.warn("백엔드 로그아웃 API 호출 차단됨(403 등). 로컬 청소를 강제 진행합니다.");
    })
    .finally(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    })
}

/**
 * 내 정보 조회
 * 백엔드 Spring Security가 토큰을 파싱해서 로그인한 유저의 정보(id, role 등)를 던져주는 API입니다.
 */
export async function getMe() {
  return axiosInstance.get('/auth/me')
    .then(res => res.data)
}

/**
 * 비밀번호 변경
 */
export async function changePassword(currentPassword, newPassword) {
  return axiosInstance.put('/auth/password', { currentPassword, newPassword })
    .then(res => res.data)
}

/**
 * 민원인 회원가입 API (최종 주소 규격 통합)
 */
export async function register(username, password, name, email, phone) {
  // 💡 기존의 '/register' 에서 '/auth/register' 로 경로를 수정하여 시큐리티 프리패스 라인에 완벽히 탑승시킵니다!
  return axiosInstance.post('/auth/register', {
    username, 
    password,
    name,
    email,
    phone
  }).then(res => res.data)
}

/**
 * 마이페이지 정보 수정
 */
export async function updateProfile(data) {
  return axiosInstance.put('/user/me', data).then((res) => res.data)
}