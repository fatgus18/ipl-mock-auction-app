import time
import io
import re
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from fuzzywuzzy import process, fuzz
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

# --- CONFIGURATION ---
SHEET_URL = "https://docs.google.com/spreadsheets/d/1TLRf-W9eGz_YGwNcNOueTlZIorICyGtnVqnzMFQ-Tvw/edit?gid=162249526#gid=162249526"
SHEET_NAME = "POINTS"
TEAMS_SHEET_NAME = "THE TEAMS"
JSON_KEY_FILE = "credentials.json"

# --- URLS ---
CRICINFO_MVP_URL = "https://www.espncricinfo.com/series/ipl-2026-1510719/most-valuable-players"
CRICINFO_IMPACT_BATTERS_URL = "https://www.espncricinfo.com/series/ipl-2026-1510719/most-impactful-batters"
CRICINFO_IMPACT_BOWLERS_URL = "https://www.espncricinfo.com/series/ipl-2026-1510719/most-impactful-bowlers"

def get_cricinfo_mvp_data_selenium(url):
    print("Launching Chrome to fetch Master Data (MVP, Runs, Wickets, Impact/Mat)...")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.get(url)
        time.sleep(5) 
        page_html = driver.page_source
        driver.quit()
    except Exception as e:
        print(f"Error initializing Chrome driver: {e}")
        return {}

    try:
        html_buffer = io.StringIO(page_html)
        tables = pd.read_html(html_buffer)
        mvp_df = None
        for table in tables:
            if 'Player' in table.columns and any('T.Impact' in col for col in table.columns):
                mvp_df = table
                break
        if mvp_df is None:
            print("Could not find the main table.")
            return {}
    except ValueError as e:
        return {}

    # Dynamically find columns
    score_col = [col for col in mvp_df.columns if 'T.Impact' in col][0]
    team_col = [col for col in mvp_df.columns if 'Team' in col]
    team_col = team_col[0] if team_col else None
    runs_col = [col for col in mvp_df.columns if 'Runs' in col][0]
    wkts_col = [col for col in mvp_df.columns if 'Wkts' in col][0]
    
    impact_mat_col = [col for col in mvp_df.columns if 'Impact/Mat' in col]
    impact_mat_col = impact_mat_col[0] if impact_mat_col else None

    mvp_dict = {}
    runs_dict = {}
    wkts_dict = {}
    impact_mat_dict = {}
    team_stats = {}
    player_to_real_team = {}
    
    print(f"Processing {len(mvp_df)} players...")
    
    for index, row in mvp_df.iterrows():
        player_name = str(row['Player']).strip()
        try:
            points = float(row[score_col])
            mvp_dict[player_name] = points
            
            raw_runs = str(row[runs_col]).strip().replace('-', '0')
            runs_dict[player_name] = int(raw_runs) if raw_runs.isdigit() else 0
            
            raw_wkts = str(row[wkts_col]).strip().replace('-', '0')
            wkts_dict[player_name] = int(raw_wkts) if raw_wkts.isdigit() else 0

            if impact_mat_col:
                raw_imat = str(row[impact_mat_col]).strip().replace('-', '0')
                try:
                    impact_mat_dict[player_name] = float(raw_imat)
                except ValueError:
                    impact_mat_dict[player_name] = 0.0

            if team_col:
                team_name = str(row[team_col]).strip()
                if team_name and team_name.lower() != 'nan':
                    player_to_real_team[player_name] = team_name
                    if team_name not in team_stats:
                        team_stats[team_name] = {'pts': 0, 'count': 0}
                    team_stats[team_name]['pts'] += points
                    team_stats[team_name]['count'] += 1
        except (ValueError, TypeError):
            continue 
            
    print(f"Successfully extracted all stats for {len(mvp_dict)} players.")
    return {
        "players": mvp_dict, 
        "teams": team_stats, 
        "player_teams": player_to_real_team,
        "runs": runs_dict,
        "wkts": wkts_dict,
        "impact_mat": impact_mat_dict
    }

def get_cricinfo_impact_data_selenium(url):
    print(f"Launching Chrome to fetch Impact Data from {url}...")
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.get(url)
        time.sleep(5) 
        page_html = driver.page_source
        driver.quit()
    except Exception as e:
        print(f"Error initializing Chrome driver: {e}")
        return {}

    try:
        html_buffer = io.StringIO(page_html)
        tables = pd.read_html(html_buffer)
        impact_df = None
        for table in tables:
            if 'Player' in table.columns and any('Impact' in col for col in table.columns):
                impact_df = table
                break
        if impact_df is None:
            return {}
    except ValueError as e:
        return {}

    score_col = [col for col in impact_df.columns if 'Impact' in col][0]

    impact_dict = {}
    for index, row in impact_df.iterrows():
        player_name = str(row['Player']).strip()
        try:
            points = float(row[score_col])
            impact_dict[player_name] = points
        except (ValueError, TypeError):
            continue 
            
    return impact_dict

def update_google_sheet(sheet_url, sheet_name, payload, impact_batters, impact_bowlers):
    mvp_data = payload.get("players", {})
    team_data = payload.get("teams", {})
    player_to_real_team = payload.get("player_teams", {})
    runs_data = payload.get("runs", {})
    wkts_data = payload.get("wkts", {})
    impact_mat_data = payload.get("impact_mat", {})
    
    # Calculate average points per player
    total_players = len(mvp_data)
    total_points = sum(mvp_data.values()) if mvp_data else 0
    avg_points = total_points / total_players if total_players else 0
    
    print("Connecting to Google Sheets...")
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name(JSON_KEY_FILE, scope)
    client = gspread.authorize(creds)

    try:
        sheet = client.open_by_url(sheet_url).worksheet(sheet_name)
    except gspread.exceptions.WorksheetNotFound:
        print(f"Error: Worksheet '{sheet_name}' not found.")
        return

    # Extract Auction Prices for ROI calculations
    player_prices = {}
    try:
        teams_sheet = client.open_by_url(sheet_url).worksheet(TEAMS_SHEET_NAME)
        teams_data = teams_sheet.get_all_values()
        for col in range(len(teams_data[0])):
            for row in range(1, len(teams_data)):
                val = teams_data[row][col].strip()
                if "-" in val:
                    parts = val.split("-")
                    name_part = "-".join(parts[:-1]).strip()
                    price_part = parts[-1].strip()
                    clean_name = re.sub(r'[^a-z]', '', name_part.lower())
                    price_str = re.sub(r'[^\d.]', '', price_part)
                    if price_str and clean_name:
                        player_prices[clean_name] = float(price_str)
    except Exception as e:
        print(f"Error reading {TEAMS_SHEET_NAME} tab: {e}")

    player_names = sheet.col_values(1)
    updates_col_b = []
    updates_col_c = []
    updates_col_d = [] # NEW: Impact/Mat Tracking
    scraped_names = list(mvp_data.keys())

    print("Matching players and calculating points...")
    participants = ["PRAMODH", "VARRSAN", "SUHAAS", "JEFFRICK", "PRANAV", "SHRINIL", "GHOUSE", "SANATH"]
    
    participant_scores = {p: 0.0 for p in participants}
    scraped_player_to_owner = {}
    owner_player_breakdown = {p: [] for p in participants}
    captain_points = {}
    dead_weight_counts = {p: 0 for p in participants}
    
    participant_base_scores = {p: 0.0 for p in participants}
    participant_duo_scores = {p: 0.0 for p in participants}
    participant_depth_scores = {p: 0.0 for p in participants}
    participant_franchise_counts = {p: {} for p in participants}
    participant_impact_mat_sum = {p: 0.0 for p in participants}
    
    participant_max_player_pts = {p: 0.0 for p in participants}
    captain_base_points = {p: 0.0 for p in participants}
    top3_base_points = {p: 0.0 for p in participants}
    
    player_roi_list = []
    player_index = -1 
    current_participant = None

    # --- PASS 1: Calculate Points and Build Mock Draft Roster ---
    for i, name in enumerate(player_names):
        original_name = str(name).strip()
        if not original_name:
            updates_col_b.append([""]) 
            updates_col_c.append([""])
            updates_col_d.append([""])
            continue

        upper_name = original_name.upper()

        if any(p in upper_name for p in participants):
            player_index = 0
            for p in participants:
                if p in upper_name:
                    current_participant = p
                    break
            updates_col_b.append([""])
            updates_col_c.append([""])
            updates_col_d.append([""])
            continue
            
        if "TOTAL" in upper_name:
            if current_participant:
                updates_col_b.append([participant_scores[current_participant]])
                updates_col_d.append([round(participant_impact_mat_sum[current_participant], 1)])
            else:
                updates_col_b.append([""])
                updates_col_d.append([""])
            updates_col_c.append([""])
            player_index = -1
            current_participant = None 
            continue

        if player_index >= 0:
            player_index += 1
            search_name = original_name.replace("(C)", "").replace("(VC)", "").replace("👑", "").strip()

            multiplier = 1.0
            if player_index == 1:
                multiplier = 2.0
            elif player_index == 2:
                multiplier = 1.5

            match_found = False
            base_points = 0
            matched_scraped_name = ""
            
            search_clean = search_name.lower().replace(".", "").replace("-", "").replace(" ", "")
            for scraped_name in scraped_names:
                scraped_clean = scraped_name.lower().replace(".", "").replace("-", "").replace(" ", "").replace(u'\xa0', '')
                if search_clean == scraped_clean or (search_clean == "klrahul" and "klrahul" in scraped_clean):
                    base_points = mvp_data[scraped_name]
                    matched_scraped_name = scraped_name
                    match_found = True
                    break
            
            if not match_found:
                best_match, score = process.extractOne(search_name, scraped_names, scorer=fuzz.ratio)
                if score >= 85: 
                    base_points = mvp_data[best_match]
                    matched_scraped_name = best_match
                    match_found = True

            if match_found:
                if current_participant:
                    scraped_player_to_owner[matched_scraped_name] = current_participant
                    
                calculated_points = base_points * multiplier
                deviation = round(base_points - avg_points, 2)
                
                # Fetch Impact/Mat and apply Multiplier
                base_impact_mat = impact_mat_data.get(matched_scraped_name, 0.0)
                calc_impact_mat = base_impact_mat * multiplier
                
                updates_col_b.append([calculated_points])
                updates_col_c.append([deviation])
                updates_col_d.append([round(calc_impact_mat, 1)])
                
                if current_participant:
                    participant_scores[current_participant] += calculated_points
                    participant_impact_mat_sum[current_participant] += calc_impact_mat
                    owner_player_breakdown[current_participant].append((original_name, calculated_points))
                    participant_base_scores[current_participant] += base_points
                    
                    if player_index <= 3:
                        top3_base_points[current_participant] += base_points
                    
                    if base_points > participant_max_player_pts[current_participant]:
                        participant_max_player_pts[current_participant] = base_points
                    
                    if player_index == 1 or player_index == 2:
                        participant_duo_scores[current_participant] += calculated_points
                        if player_index == 1:
                            captain_points[current_participant] = {"name": original_name, "pts": calculated_points}
                            captain_base_points[current_participant] = base_points
                    else:
                        participant_depth_scores[current_participant] += calculated_points
                        
                    real_team = player_to_real_team.get(matched_scraped_name)
                    if real_team:
                        participant_franchise_counts[current_participant][real_team] = participant_franchise_counts[current_participant].get(real_team, 0) + 1

                    if calculated_points <= 0:
                        dead_weight_counts[current_participant] += 1
                        
                    price_key = re.sub(r'[^a-z]', '', original_name.lower())
                    price = player_prices.get(price_key)
                    if price and price > 0:
                        roi = base_points / price
                        player_roi_list.append((original_name, current_participant, roi, price, base_points))
            else:
                updates_col_b.append([""])
                updates_col_c.append([""])
                updates_col_d.append([""])
                if current_participant and player_index > 0:
                    dead_weight_counts[current_participant] += 1
        else:
            updates_col_b.append([""])
            updates_col_c.append([""])
            updates_col_d.append([""])

    if updates_col_c:
        updates_col_c[0] = ["Deviation"]
    if updates_col_d:
        updates_col_d[0] = ["Avg Pts/Mat"]

    print("\nCalculating Standings...")
    sorted_standings = sorted(participant_scores.items(), key=lambda x: x[1], reverse=True)
    
    if len(sorted_standings) >= 3:
        first_place_id = sorted_standings[0][0]
        first_place_score = sorted_standings[0][1]
        second_place_id = sorted_standings[1][0]
        second_place_score = sorted_standings[1][1]
        third_place_id = sorted_standings[2][0]
        third_place_score = sorted_standings[2][1]

        first_display = f"{first_place_id} 👑 ({first_place_score:.1f})"
        second_display = f"{second_place_id} ({second_place_score:.1f})"
        third_display = f"{third_place_id} ({third_place_score:.1f})"

        updates_col_a = []
        for name in player_names:
            original = str(name).strip()
            clean_name = original.replace("👑", "").strip()
            for p in participants:
                if p in clean_name.upper():
                    if p == first_place_id:
                        clean_name = f"{clean_name} 👑"
                    break
            updates_col_a.append([clean_name])

        if updates_col_a:
            sheet.update(range_name=f"A1:A{len(updates_col_a)}", values=updates_col_a)
        if updates_col_b:
            sheet.update(range_name=f"B1:B{len(updates_col_b)}", values=updates_col_b)
        if updates_col_c:
            sheet.update(range_name=f"C1:C{len(updates_col_c)}", values=updates_col_c)
        if updates_col_d:
            sheet.update(range_name=f"D1:D{len(updates_col_d)}", values=updates_col_d)

        try:
            # Shifted Podium locations
            sheet.update(range_name="F5", values=[[first_display]])
            sheet.update(range_name="E6", values=[[second_display]])
            sheet.update(range_name="G7", values=[[third_display]])
        except Exception:
            pass

    print("\nDeploying Mobile-Optimized Advanced Stats (Shifted to F and I)...")

    try:
        # Clear out old columns to keep sheet tidy (Adjusted to new shifted ranges)
        sheet.batch_clear(["J1:Z200", "F90:F200", "I100:I200"])
    except Exception as e:
        pass

    # ==========================================
    # COLUMN F STATS (Global & Core Analytics)
    # ==========================================
    if mvp_data:
        highest_player = max(mvp_data, key=mvp_data.get)
        lowest_player = min(mvp_data, key=mvp_data.get)
        
        stats_updates = [
            ["--- TOURNAMENT STATS ---"],
            [f"Total Tracked Players: {total_players}"],
            [f"Total MVP Points: {total_points:.1f}"],
            [f"Avg Points / Player: {avg_points:.2f}"],
            [f"Highest: {highest_player} ({mvp_data[highest_player]:.1f})"],
            [f"Lowest: {lowest_player} ({mvp_data[lowest_player]:.1f})"]
        ]
        sheet.update(range_name=f"F14:F{14+len(stats_updates)-1}", values=stats_updates)

    sorted_teams = sorted(team_data.items(), key=lambda x: x[1]['pts'], reverse=True)
    block_team = [["--- TEAM MVP STANDINGS ---"]] + [[f"{t} ({d['pts']:.1f})"] for t, d in sorted_teams]
    sheet.update(range_name=f"F24:F{24+len(block_team)-1}", values=block_team)

    eff_teams = [(t, d['pts'] / d['count']) for t, d in team_data.items() if d['count'] > 0]
    eff_teams.sort(key=lambda x: x[1], reverse=True)
    block_eff = [["--- EFFICIENT FRANCHISES ---"], ["(Avg Pts per Player)"]] + [[f"{t}: {avg:.1f}"] for t, avg in eff_teams]
    sheet.update(range_name=f"F39:F{39+len(block_eff)-1}", values=block_eff)

    sorted_base = sorted(participant_base_scores.items(), key=lambda x: x[1], reverse=True)
    block_base = [["--- PURIST LEADERBOARD ---"], ["(No 2x/1.5x Multipliers)"]] + [[f"{p} ({pts:.1f})"] for p, pts in sorted_base]
    sheet.update(range_name=f"F55:F{55+len(block_base)-1}", values=block_base)

    loyalty_list = []
    for p in participants:
        if participant_franchise_counts[p]:
            top_team = max(participant_franchise_counts[p].items(), key=lambda x: x[1])
            loyalty_list.append((p, top_team[0], top_team[1]))
    loyalty_list.sort(key=lambda x: x[2], reverse=True)
    block_loyalty = [["--- FRANCHISE LOYALTY ---"], ["(Most players from 1 IPL team)"]] + [[f"{p}: {cnt} ({tm})"] for p, tm, cnt in loyalty_list]
    sheet.update(range_name=f"F69:F{69+len(block_loyalty)-1}", values=block_loyalty)

    if player_roi_list:
        sorted_roi = sorted(player_roi_list, key=lambda x: x[2], reverse=True)
        top_roi = sorted_roi[:10]
        block_roi_top = [["--- BEST VALUE SIGNINGS ---"], ["(Pts per Crore Spent)"]] + [[f"{p[0]} ({p[1]}): {p[2]:.1f}"] for p in top_roi]
        sheet.update(range_name=f"F83:F{83+len(block_roi_top)-1}", values=block_roi_top)

    # ==========================================
    # COLUMN I STATS (Mock Draft Banter)
    # ==========================================
    sorted_mvp_desc = sorted(mvp_data.items(), key=lambda x: x[1], reverse=True)
    top_20 = sorted_mvp_desc[:20]
    updates_col_i = [["--- TOP 20 MVP ---"]]
    for player, points in top_20:
        owner = scraped_player_to_owner.get(player)
        if owner:
            updates_col_i.append([f"{player} - {owner} ({points})"])
        else:
            updates_col_i.append([f"{player} ({points})"])
    sheet.update(range_name=f"I1:I{len(updates_col_i)}", values=updates_col_i)

    undrafted = {p: pts for p, pts in mvp_data.items() if p not in scraped_player_to_owner}
    top_undrafted = sorted(undrafted.items(), key=lambda x: x[1], reverse=True)[:5]
    block_undrafted = [["--- UNDRAFTED GEMS ---"]] + [[f"{p} ({pts})"] for p, pts in top_undrafted]
    sheet.update(range_name=f"I25:I{25+len(block_undrafted)-1}", values=block_undrafted)

    caps = sorted(captain_points.items(), key=lambda x: x[1]["pts"], reverse=True)
    block_caps = [["--- CAPTAINS LEADERBOARD ---"]] + [[f"{c[1]['name']} - {c[0]} ({c[1]['pts']})"] for c in caps]
    sheet.update(range_name=f"I34:I{34+len(block_caps)-1}", values=block_caps)

    dead_weights = sorted(dead_weight_counts.items(), key=lambda x: x[1], reverse=True)
    block_dead = [["--- DEAD WEIGHT (0 Pts) ---"]] + [[f"{o}: {cnt} players"] for o, cnt in dead_weights]
    sheet.update(range_name=f"I47:I{47+len(block_dead)-1}", values=block_dead)

    hardest_carry = None
    max_carry_pct = 0
    for owner, total in participant_scores.items():
        if total > 0 and owner_player_breakdown[owner]:
            top_player = max(owner_player_breakdown[owner], key=lambda x: x[1])
            pct = top_player[1] / total
            if pct > max_carry_pct:
                max_carry_pct = pct
                hardest_carry = f"{top_player[0]} ({pct*100:.1f}%) for {owner}"
    block_carry = [["--- HARDEST CARRY ---"], [hardest_carry] if hardest_carry else ["N/A"]]
    sheet.update(range_name=f"I59:I{59+len(block_carry)-1}", values=block_carry)

    sorted_duo = sorted(participant_duo_scores.items(), key=lambda x: x[1], reverse=True)
    block_duo = [["--- THE DYNAMIC DUO ---"], ["(C + VC Points Only)"]] + [[f"{p} ({pts:.1f})"] for p, pts in sorted_duo]
    sheet.update(range_name=f"I65:I{65+len(block_duo)-1}", values=block_duo)

    sorted_depth = sorted(participant_depth_scores.items(), key=lambda x: x[1], reverse=True)
    block_depth = [["--- ROSTER DEPTH ---"], ["(Points excluding C & VC)"]] + [[f"{p} ({pts:.1f})"] for p, pts in sorted_depth]
    sheet.update(range_name=f"I79:I{79+len(block_depth)-1}", values=block_depth)

    if player_roi_list:
        worst_roi = sorted([p for p in player_roi_list if p[3] > 2.0], key=lambda x: x[2])[:5]
        block_roi_worst = [["--- WORST VALUE SIGNINGS ---"], ["(Min 2 Cr Spent)"]] + [[f"{p[0]} ({p[1]}): {p[2]:.1f}"] for p in worst_roi]
        sheet.update(range_name=f"I93:I{93+len(block_roi_worst)-1}", values=block_roi_worst)

    # ==========================================
    # CAP RACES (Orange & Purple - F103 & I103)
    # ==========================================
    sorted_batters = sorted(runs_data.items(), key=lambda x: x[1], reverse=True)[:10]
    block_batters = [["--- ORANGE CAP (Top 10) ---"]]
    for player, runs in sorted_batters:
        if runs == 0: continue 
        owner = scraped_player_to_owner.get(player)
        display_str = f"{player} - {owner} ({runs})" if owner else f"{player} ({runs})"
        block_batters.append([display_str])
        
    if len(block_batters) > 1:
        try:
            sheet.update(range_name=f"F103:F{103+len(block_batters)-1}", values=block_batters)
        except Exception as e:
            pass

    sorted_bowlers = sorted(wkts_data.items(), key=lambda x: x[1], reverse=True)[:10]
    block_bowlers = [["--- PURPLE CAP (Top 10) ---"]]
    for player, wkts in sorted_bowlers:
        if wkts == 0: continue 
        owner = scraped_player_to_owner.get(player)
        display_str = f"{player} - {owner} ({wkts})" if owner else f"{player} ({wkts})"
        block_bowlers.append([display_str])
        
    if len(block_bowlers) > 1:
        try:
            sheet.update(range_name=f"I103:I{103+len(block_bowlers)-1}", values=block_bowlers)
        except Exception as e:
            pass

    # ==========================================
    # REGRET & TOP ORDER (F116 & I116)
    # ==========================================
    regret_list = []
    for p in participants:
        regret = participant_max_player_pts[p] - captain_base_points[p]
        regret_list.append((p, regret if regret > 0 else 0.0))
    regret_list.sort(key=lambda x: x[1], reverse=True)
    block_regret = [["--- CAPTAINCY REGRET ---"], ["(Max Pts on Roster - Cap Pts)"]] + [[f"{p}: {r:.1f} pts missed"] for p, r in regret_list]
    try:
        sheet.update(range_name=f"F116:F{116+len(block_regret)-1}", values=block_regret)
    except Exception as e:
        print(f"Error updating Captaincy Regret: {e}")

    top_order_list = []
    for p in participants:
        total = participant_base_scores[p]
        top3 = top3_base_points[p]
        pct = (top3 / total * 100) if total > 0 else 0
        top_order_list.append((p, pct))
    top_order_list.sort(key=lambda x: x[1], reverse=True)
    block_top_order = [["--- HEAVY TOP ORDER ---"], ["(% of Base Pts from Picks 1-3)"]] + [[f"{p}: {pct:.1f}%"] for p, pct in top_order_list]
    try:
        sheet.update(range_name=f"I116:I{116+len(block_top_order)-1}", values=block_top_order)
    except Exception as e:
        print(f"Error updating Heavy Top Order: {e}")

    # ==========================================
    # IMPACTFUL BATTERS & BOWLERS (F128 & I128)
    # ==========================================
    def get_owner_for_impact(p_name):
        if p_name in scraped_player_to_owner:
            return scraped_player_to_owner[p_name]
        
        c_name = p_name.lower().replace(".", "").replace("-", "").replace(" ", "").replace(u'\xa0', '')
        for s_name, owner in scraped_player_to_owner.items():
            s_clean = s_name.lower().replace(".", "").replace("-", "").replace(" ", "").replace(u'\xa0', '')
            if c_name in s_clean or s_clean in c_name:
                return owner
                
        match, score = process.extractOne(p_name, list(scraped_player_to_owner.keys()), scorer=fuzz.ratio)
        if score >= 85:
            return scraped_player_to_owner[match]
        return None

    if impact_batters:
        sorted_imp_batters = sorted(impact_batters.items(), key=lambda x: x[1], reverse=True)[:5]
        block_imp_batters = [["--- IMPACTFUL BATTERS ---"]]
        for player, pts in sorted_imp_batters:
            owner = get_owner_for_impact(player)
            display_str = f"{player} - {owner} ({pts:.1f})" if owner else f"{player} ({pts:.1f})"
            block_imp_batters.append([display_str])
        try:
            sheet.update(range_name=f"F128:F{128+len(block_imp_batters)-1}", values=block_imp_batters)
        except Exception as e:
            print(f"Error updating Impactful Batters: {e}")

    if impact_bowlers:
        sorted_imp_bowlers = sorted(impact_bowlers.items(), key=lambda x: x[1], reverse=True)[:5]
        block_imp_bowlers = [["--- IMPACTFUL BOWLERS ---"]]
        for player, pts in sorted_imp_bowlers:
            owner = get_owner_for_impact(player)
            display_str = f"{player} - {owner} ({pts:.1f})" if owner else f"{player} ({pts:.1f})"
            block_imp_bowlers.append([display_str])
        try:
            sheet.update(range_name=f"I128:I{128+len(block_imp_bowlers)-1}", values=block_imp_bowlers)
        except Exception as e:
            print(f"Error updating Impactful Bowlers: {e}")

    # ==========================================
    # EXPENSIVE DUDS (F140)
    # ==========================================
    expensive_duds = sorted([p for p in player_roi_list if p[4] >= 0 and p[3] >= 5.0], key=lambda x: x[4])[:5]
    if expensive_duds:
        block_duds = [["--- EXPENSIVE DUDS ---"], ["(>= 5 Cr, >= 0 Pts)"]] + [[f"{p[0]} - {p[1]} ({p[4]:.1f} pts, ₹{p[3]}Cr)"] for p in expensive_duds]
        try:
            sheet.update(range_name=f"F140:F{140+len(block_duds)-1}", values=block_duds)
        except Exception as e:
            print(f"Error updating Expensive Duds: {e}")

    # --- THE FIX: FORGIVING KL RAHUL RULE ---
    kl_points = None
    kl_deviation = None
    kl_impact_mat = None
    for scraped_name, points in mvp_data.items():
        scraped_clean = scraped_name.lower().replace(".", "").replace("-", "").replace(" ", "").replace(u'\xa0', '')
        if "klrahul" in scraped_clean:
            kl_points = points * 2
            kl_deviation = round(kl_points - avg_points, 2)
            base_imat = impact_mat_data.get(scraped_name, 0.0)
            kl_impact_mat = round(base_imat * 2, 1)
            break
            
    if kl_points is not None:
        try:
            sheet.update(range_name="B60", values=[[kl_points]])
            sheet.update(range_name="C60", values=[[kl_deviation]])
            if kl_impact_mat is not None:
                sheet.update(range_name="D60", values=[[kl_impact_mat]])
        except Exception as e:
            pass

    # ==========================================
    # COLUMN J STATS (Overall Leaderboard & Avg Pts/Mat)
    # ==========================================
    sorted_all_participants = sorted(participant_scores.items(), key=lambda x: x[1], reverse=True)
    block_leaderboard = [["--- OVERALL LEADERBOARD ---"]]

    for participant, total_points in sorted_all_participants:
        leaderboard_entry = f"{participant} : {total_points:.1f}"
        block_leaderboard.append([leaderboard_entry])

    try:
        sheet.update(range_name=f"J1:J{len(block_leaderboard)}", values=block_leaderboard)
    except Exception as e:
        print(f"Error updating Overall Leaderboard: {e}")

    # NEW: Avg Pts/Mat Leaderboard (J11)
    sorted_avg_mat = sorted(participant_impact_mat_sum.items(), key=lambda x: x[1], reverse=True)
    block_avg_mat = [["--- AVG PTS/MAT LEADERBOARD ---"]]
    for p, score in sorted_avg_mat:
        block_avg_mat.append([f"{p} : {score:.1f}"])
        
    try:
        sheet.update(range_name=f"J11:J{11+len(block_avg_mat)-1}", values=block_avg_mat)
    except Exception as e:
        print(f"Error updating Avg Pts/Mat Leaderboard: {e}")

    print("\nAll Advanced Analytics and Cap Races deployed successfully!")

if __name__ == "__main__":
    payload = get_cricinfo_mvp_data_selenium(CRICINFO_MVP_URL)
    impact_batters = get_cricinfo_impact_data_selenium(CRICINFO_IMPACT_BATTERS_URL)
    impact_bowlers = get_cricinfo_impact_data_selenium(CRICINFO_IMPACT_BOWLERS_URL)
    
    if payload and payload.get("players"):
        update_google_sheet(SHEET_URL, SHEET_NAME, payload, impact_batters, impact_bowlers)