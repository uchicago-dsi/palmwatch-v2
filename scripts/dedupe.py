# %% 
import pandas as pd
# jaro
from jaro import jaro_winkler_metric
import os
from tqdm import tqdm
# %%
# Load data
# file dir 
file_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(file_dir, '..', 'public', 'data')
df = pd.read_feather(os.path.join(data_dir, 'uml.arrow'))
# %%


def find_closest(df, col, threshold=0.9):
    """
    Find the closest string in a column
    """
    # Create a copy of the dataframe
    df = df.copy()
    unique_vals = df[col].unique()
    df = df[df[col].notnull()][[col]]
    df = df.drop_duplicates(subset=col)

    output = []
    for val in tqdm(unique_vals):
        if not isinstance(val, str):
            continue
        try:
          # Find the closest string
          subdf = df.copy()
          subdf['matched'] = subdf[col].apply(lambda x: jaro_winkler_metric(x, val) if isinstance(x, str) else 0)
          subdf = subdf.sort_values('matched', ascending=False)
          subdf = subdf[subdf['matched'] > threshold]
          subdf = subdf[subdf[col] != val]
          if subdf.shape[0] == 0:
            continue
          out = {
              'value': val,
          }
          for i in range(5):
              try:  
                  out[f'ismatch_{i+1}'] = 0
                  out[f'top{i+1}'] = subdf.iloc[i][col]
              except:
                  out[f'top{i+1}'] = None
          output.append(out)
        except:
          print('failed ', val)
    return pd.DataFrame(output)
# %%
closest = find_closest(df, 'Parent Company')
closest = closest.sort_values('value')
closest.to_csv(os.path.join(data_dir, 'closest_parent_to_match.csv'), index=False)

closest = find_closest(df, 'Group Name')
closest = closest.sort_values('value')
closest.to_csv(os.path.join(data_dir, 'closest_group_to_match.csv'), index=False)
# %%
# read closest_group.csv
def get_match(row):
    for i in range(5):
        if row[f'ismatch_{i+1}'] == 1:
            return row[f'top{i+1}']
    return None

def get_matches(filename):
  df = pd.read_csv(os.path.join(data_dir, filename))
  df['match'] = df.apply(get_match, axis=1)
  df = df[['value', 'match']]
  df = df[df['match'].notnull()]
  return df
# %%
parent_matches = get_matches('closest_parent.csv')
group_matches = get_matches('closest_group.csv')
# %%
# rename to parent_match
parent_matches = parent_matches.rename(columns={'value': 'Parent Company', 'match': 'parent_match'})
group_matches = group_matches.rename(columns={'value': 'Group Name', 'match': 'group_match'})
# merge with df
df = df.merge(parent_matches, on='Parent Company', how='left')
df = df.merge(group_matches, on='Group Name', how='left')
# %%
df['Parent Company'] = df['parent_match'].fillna(df['Parent Company'])
df['Group Name'] = df['group_match'].fillna(df['Group Name'])
# %%
df.to_feather(os.path.join(data_dir, 'uml_deduped.arrow'))
# %%
