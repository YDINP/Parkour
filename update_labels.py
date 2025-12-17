import json
import sys

# 프리팹 파일 경로
prefab_path = r"C:\Users\a\Documents\Parkour\assets\resources\prefabs\UIHeroShop.prefab"

# KAKAOFRIENDSREGULAR 폰트 UUID
KAKAO_FONT_UUID = "bdc7ca43-344a-44d5-b6b1-0fa9096ce47f"

# 파일 읽기
with open(prefab_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Label 노드 찾기 및 수정
modified_count = 0
outline_added_count = 0

for i, item in enumerate(data):
    if isinstance(item, dict) and item.get('__type__') == 'cc.Label':
        node_id = item.get('node', {}).get('__id__')
        print(f"Processing Label at index {i}, node __id__: {node_id}")

        # 폰트를 KAKAOFRIENDSREGULAR로 변경
        item['_N$file'] = {"__uuid__": KAKAO_FONT_UUID}
        item['_isSystemFontUsed'] = False

        modified_count += 1

        # 다음 항목이 LabelOutline인지 확인
        has_outline = False
        if i + 1 < len(data):
            next_item = data[i + 1]
            if isinstance(next_item, dict) and next_item.get('__type__') == 'cc.LabelOutline':
                # 기존 outline의 색상을 검은색으로, width를 2로 변경
                next_item['_color'] = {
                    "__type__": "cc.Color",
                    "r": 0,
                    "g": 0,
                    "b": 0,
                    "a": 255
                }
                next_item['_width'] = 2
                has_outline = True
                print(f"  Updated existing LabelOutline")

        # LabelOutline이 없으면 추가
        if not has_outline:
            # PrefabInfo 찾기 (Label 다음에 있음)
            prefab_info_index = i + 1
            if prefab_info_index < len(data):
                # LabelOutline 컴포넌트 생성
                label_outline = {
                    "__type__": "cc.LabelOutline",
                    "_name": "",
                    "_objFlags": 0,
                    "node": {
                        "__id__": node_id
                    },
                    "_enabled": True,
                    "_color": {
                        "__type__": "cc.Color",
                        "r": 0,
                        "g": 0,
                        "b": 0,
                        "a": 255
                    },
                    "_width": 2,
                    "_id": ""
                }

                # Label과 PrefabInfo 사이에 LabelOutline 삽입
                data.insert(prefab_info_index, label_outline)
                outline_added_count += 1
                print(f"  Added new LabelOutline")

print(f"\nTotal Labels modified: {modified_count}")
print(f"LabelOutlines added: {outline_added_count}")

# 파일 저장
with open(prefab_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nPrefab file updated successfully!")
