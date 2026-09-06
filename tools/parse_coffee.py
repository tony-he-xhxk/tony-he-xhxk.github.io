#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""解析 评测数据.txt → assets/data/coffee_reviews.json

数据文件格式（UTF-8，空行分隔逻辑块）：

    纯美式区                       ← 区域名（以"区"结尾的行）
    标准美式（瑞幸）               ← 商品卡名
    测评年月：2026-09             ← 一次测评开始
    配置：少少甜/意式拼配/无奶/冰
    热量参考：47大卡
    评分：83/100
    评价：少少甜的甜度非常适合…     ← 可跨行，遇空行结束

解析输出 JSON 结构：
    {
      "updated": "2026-09-06",          # 生成日期（可选）
      "regions": [
        {
          "name": "纯美式区",
          "cards": [
            {
              "name": "标准美式（瑞幸）",
              "reviews": [
                {"date": "2026-09", "config": "...", "kcal": 47, "score": 83, "comment": "..."}
              ]
            }
          ]
        }
      ]
    }
"""
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # 仓库根
DEFAULT_SRC = os.path.join(BASE, "专栏", "2-美式咖啡横评", "评测数据.txt")
DEFAULT_DST = os.path.join(BASE, "assets", "data", "coffee_reviews.json")

KEY_RE = re.compile(r"^(测评年月|配置|热量参考|评分|评价)：(.*)$")
KCAL_RE = re.compile(r"^(\d+)大卡$")
SCORE_RE = re.compile(r"^(\d+)/100$")


def parse(src_path):
    """按状态机解析：区域 → 卡片 → 测评块。"""
    with open(src_path, encoding="utf-8") as f:
        raw_lines = [ln.rstrip("\n") for ln in f]

    regions = []
    current_region = None
    current_card = None
    current_review = None
    pending_key = None  # 处理"评价："多行拼接

    def flush_review():
        nonlocal current_review, pending_key
        if current_review is not None and current_card is not None:
            current_card["reviews"].append(current_review)
        current_review = None
        pending_key = None

    for raw in raw_lines:
        ln = raw.strip()

        # 区域标题：以"区"结尾且不含其他字段关键字
        if ln and ln.endswith("区") and not KEY_RE.match(ln):
            flush_review()
            current_region = {"name": ln, "cards": []}
            regions.append(current_region)
            current_card = None
            continue

        m = KEY_RE.match(ln)
        if not m:
            if ln == "":
                # 空行：结束当前测评（评价多行拼接终止）；卡片保留——
                # 同一商品的多次测评以空行分隔，卡片名只出现一次
                flush_review()
                continue
            # 非键值行 → 商品卡名（需尚未开始测评；若在评价多行中则拼入评价）
            if current_review is not None and pending_key == "评价":
                current_review["comment"] += "\n" + ln
                continue
            flush_review()
            if current_region is None:
                raise ValueError(f"在首个区域标题前出现卡片名：{ln}")
            current_card = {"name": ln, "reviews": []}
            current_region["cards"].append(current_card)
            continue

        key, value = m.group(1), m.group(2).strip()
        if key == "测评年月":
            flush_review()
            if current_card is None:
                # 容错：数据以测评开头但没卡片名（正常文件不会出现）
                raise ValueError("测评前缺少商品卡名称")
            current_review = {"date": value, "config": "", "kcal": 0, "score": 0, "comment": ""}
            pending_key = None
        elif key == "配置":
            if current_review is None:
                current_review = {"date": "", "config": "", "kcal": 0, "score": 0, "comment": ""}
                if current_card is None:
                    current_card = {"name": "（未知商品）", "reviews": []}
                    current_region["cards"].append(current_card)
            current_review["config"] = value
            pending_key = None
        elif key == "热量参考":
            if current_review is None:
                continue
            km = KCAL_RE.match(value)
            if not km:
                raise ValueError(f"热量参考格式无法解析：{value}")
            current_review["kcal"] = int(km.group(1))
            pending_key = None
        elif key == "评分":
            if current_review is None:
                continue
            sm = SCORE_RE.match(value)
            if not sm:
                raise ValueError(f"评分格式无法解析：{value}")
            current_review["score"] = int(sm.group(1))
            pending_key = None
        elif key == "评价":
            if current_review is None:
                continue
            current_review["comment"] = value
            pending_key = "评价"

    flush_review()
    return regions


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    dst = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_DST
    regions = parse(src)

    # 校验：区域非空、每卡至少一条测评
    total_cards = sum(len(r["cards"]) for r in regions)
    total_reviews = sum(len(c["reviews"]) for r in regions for c in r["cards"])
    for r in regions:
        if not r["cards"]:
            raise ValueError(f"区域「{r['name']}」没有商品卡片")
        for c in r["cards"]:
            if not c["reviews"]:
                raise ValueError(f"卡片「{c['name']}」没有测评记录")

    data = {"regions": regions}
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"OK: {src}")
    print(f"  → {dst}")
    print(f"  区域 {len(regions)} 个，卡片 {total_cards} 个，测评 {total_reviews} 条")
    for r in regions:
        print(f"    - {r['name']}: {len(r['cards'])} 卡")


if __name__ == "__main__":
    main()
