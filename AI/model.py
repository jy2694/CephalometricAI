import json


import net
from net import *
import torch
from func import argsoftmax

data = {
  "normal": [], # 정상 범주의 점들을 표시함. 녹색으로 표시될 점들임.
  "user": [], #사용자가 찍는 점, 오랜지색으로 표시되며 인공지능에서 생성하지 않아도 됨.
  "predicted": [ #인공지능이 예측한 점, 빨간색으로 표시됨.
    {
      "x": 3000.6936, #사진의 해상도 기준 x 좌표
      "y": 3000.3784, #사진의 해상도 기준 y 좌표
      "name": "p1", #점의 이름, 직선을 연결할 점이 아니라면 ""로 공백처리 가능.
      "type": 'filter number'
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
  "angle":[
    {
      "center":
      {
	    "x":'1440',
	    "y":'1200'
	  },
	  "p1": {
		    "x":'1740',
		    "y":'1200'
	    },
        "angle": 130
        }
    ]
}


class Model:
    def __init__(self):
        self.orig_W = None
        self.orig_H = None
        self.device_txt = 'cuda:0' if torch.cuda.is_available() else 'cpu'

        # upper case
        self.landmark_name = ['s', 'n', 'or', 'po', 'pointA', 'pointB', 'pog', 'co', 'gn', 'go', 'L1', 'u1', '13', 'Li',
                              'sn', 'softpog', '17', 'ans', '19', '20', 'u1_c', 'L1_c', '23', '24', '25', 'prn', '27',
                              '28', '29', '30', 'sm', 'softgn', 'gn2', 'GLA', 'SoftN', '36', 'u6', 'L6']

        self.aaa = ['s', 'n']

        self.model = net.UNet(1, 38).to(self.device_txt)
        self.model.load_state_dict(torch.load('./net_1.3920683841206483e-06_E_709.pth', map_location=self.device_txt))
        self.H = 800
        self.W = 640

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
            # data['line'] = [{"name": "sl line", "start":"p1", "end": "p2", "color": "red"}]
            # data['line'] = [self.line_dict()]

            json.dump(data, outfile)

    def line_dict(self):  # write_json이랑 같이 클래스 분리?
        landmark_combi = [['sella', 'nasion'], ['nasion', 'pointA'], []]

# class
