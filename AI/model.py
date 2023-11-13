import json


import net
from net import *
import torch
from func import argsoftmax
import math

data = {
  "normal": [], # 정상 범주의 점들을 표시함. 녹색으로 표시될 점들임.
  "user": [], #사용자가 찍는 점, 오랜지색으로 표시되며 인공지능에서 생성하지 않아도 됨.
  "predicted": [ #인공지능이 예측한 점, 빨간색으로 표시됨.
    {
      "x": 3000.6936, #사진의 해상도 기준 x 좌표
      "y": 3000.3784, #사진의 해상도 기준 y 좌표
      "name": "p1", #점의 이름, 직선을 연결할 점이 아니라면 ""로 공백처리 가능.
      "type": 'U1NA'
    },
    {
      "x": 1000.6936,
      "y": 1000.3784,
      "name": "p2",
    }
  ],
  # "line":[ #점과 점 사이를 잇는 직선을 표시함.
  #   {
  #     "name":"distance", # 거리를 이름으로
  #     "start":"p1", #점1의 이름
  #     "end":"p2", #점2의 이름
  #     "color":"red", #직선의 색 (red, blue, green, orange 중 택 1),
  #     "type":"필터 번호" # upper case
  #     # "distance":''
  #   }
  # ],
  # "angle":[
  #   {
  #     "center":
  #     {
	#     "x":'1440',
	#     "y":'1200'
	#   },
	#   "p1": {
	# 	    "x":'1740',
	# 	    "y":'1200'
	#     },
  #       "angle": 130
  #       }
  #   ]
}


class Model:
    def __init__(self):
        self.orig_W = None
        self.orig_H = None
        self.device_txt = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        self.line_combi = [['n', 'point_A', 'U1NA'], ['n', 'point_b', 'l1nb'], ['l1', 'l1_c', 'u1l1,L1nb'],
                          ['u1', 'u1_c', 'u1l1,u1na']]
        self.line_combi = []

        # upper case
        self.landmark_name = ['s', 'n', 'or', 'po', 'point_A', 'point_B', 'pog', 'co', 'gn', 'go', 'L1', 'U1', '12', 'Li',
                              'sn', 'softpog', '16', 'ans', '18', '19', 'u1_c', 'L1_c', '22', '23', '24', 'prn', '26',
                              '27', '28', '29', 'sm', 'softgn', 'gn2', 'GLA', 'SoftN', '35', 'u6', 'L6']

        # self.landmark_name = ['s', 'n', 'or', 'po', 'pointA', 'pointB', 'pog', 'co', 'gn', 'go', 'L1', 'u1', '13', 'Li',
        #                       'sn', 'softpog', '17', 'ans', '19', '20', 'u1_c', 'L1_c', '23', '24', '25', 'prn', '27',
        #                       '28', '29', '30', 'sm', 'softgn', 'gn2', 'GLA', 'SoftN', '36', 'u6', 'L6']

        self.aaa = ['s', 'n']

        self.model = net.UNet(1, 38).to(self.device_txt)
        self.model.load_state_dict(torch.load('./model/model.pth', map_location=self.device_txt))
        self.H = 800
        self.W = 640

        self.equation_m = lambda f, s: (f[0] - s[0]) / (f[1] - s[1])
        self.equation_sl = lambda x, f, s: self.equation_m(f, s) * x + (s[0] - (self.equation_m(f, s) * s[1]))

    def predict(self, fileDir):
        self.test_data = DataLoader(dataload(path=fileDir, H=self.H, W=self.W, aug=False, mode='img'),
                                    batch_size=1, shuffle=False, num_workers=0)

        img = cv2.imread(fr'{fileDir}')

        self.orig_H = img.shape[0]
        self.orig_W = img.shape[1]

        Ymap, Xmap = np.mgrid[0:self.H:1, 0:self.W:1]
        Ymap, Xmap = torch.tensor(Ymap.flatten(), dtype=torch.float).unsqueeze(1).to(self.device_txt), \
            torch.tensor(Xmap.flatten(), dtype=torch.float).unsqueeze(1).to(self.device_txt)

        with torch.no_grad():
            for inputs in self.test_data:
                inputs = inputs.to(self.device_txt)

                outputs = self.model(inputs)
                pred = torch.cat([argsoftmax(outputs[0].view(-1, self.H * self.W), Ymap, beta=1e-3) * (self.orig_H / self.H),
                                  argsoftmax(outputs[0].view(-1, self.H * self.W), Xmap, beta=1e-3) * (self.orig_W / self.W)],
                                 dim=1).detach().cpu()

            self.pred = list(pred.detach().cpu().numpy())

    def write_json(self, path):  # 클래스 분리?
        json_name = path + 'json'
        # path =
        with open(json_name, 'w') as outfile:
            # 이름 필터링 출력할 애만
            data["predicted"] = [{"x": float(self.pred[i][1]), "y": float(self.pred[i][0]), "name": f"{name.upper()}"}
                                 for i, name in zip(range(len(self.pred)), self.landmark_name)]

            data["predicted"] += [{"x": float(500), "y": float()}]

            self.line_dict()
            # data['line'] = [{"name": "sl line", "start":"p1", "end": "p2", "color": "red"}]
            # data['line'] = [self.line_dict()]

    def line_dict(self):  # write_json이랑 같이 클래스 분리?
        landmark_combi = [['n', 'point_A', 'U1NA'], ['n', 'point_b', 'l1nb'], ['u1', 'l1', 'u1l1'], ['u1', 'u1_c', 'u1l1,u1na'], ['l1', 'l1_c', 'u1l1'], ]
        data["line"] = [{"color": "green", "start": f"{start.upper()}", "name": f"", "end": f"{end.upper()}", "type": f"{types.upper()}"} for start, end, types in landmark_combi]

        # data["predicted"].append({"x": x, "y": y, "name": name, "type": types} for x, y, name, types in zip())

        angle_point = []
        for types in angle_point:
            self.get_angle(types)

    def get_angle(self, types):
        cx, cy, point1, point2 = self.get_center(self.pred[11], self.pred[20], self.pred[10], self.pred[21], types)
        rad = math.atan((point1[1] - cy) / (point1[0] - cx)) - math.atan((point2[1] - cy) / (point2[0] - cx))
        degree = rad / math.pi * 180

    def get_center(self, f_point1, s_point1, f_point2, s_point2, types):
        # print(f_point1, s_point1)

        center_x = lambda m1, m2, x11, x21, y11, y21: (x11 * m1 - y11 - x21 * m2 + y21) / (m1 - m2)
        center_y = lambda m1, cx, x11, y11: m1 * (cx - x11) + y11
        cx = center_x(self.equation_m(f_point1, s_point1), self.equation_m(f_point2, s_point2), s_point1[1], s_point2[1], s_point1[0],
                      s_point2[0])
        cy = center_y(self.equation_m(f_point1, s_point1), cx, f_point1[1], f_point1[0])

        data["predicted"].append({"x": cx, "y": cy, "type":types, "name":""})

        return [cx, cy, [1600, self.equation_sl(1600, f_point1, s_point1), self.equation_m(f_point1, s_point1)],
                [1600, self.equation_sl(1600, f_point2, s_point2), self.equation_m(f_point2, s_point2)]]

# class